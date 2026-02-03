import { OrderStatus, UserRole } from "../../../generated/prisma/client";
import generateOrderNumber from "../../helpers/generateOrderNumber";
import { prisma } from "../../lib/prisma";

// orderService.ts

const getAllOrders = async () => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            sellerMedicine: {
              include: {
                medicine: true,
                seller: {
                  select: { name: true }
                }
              },
            },
          },
        },
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "All platform orders retrieved successfully",
      data: orders,
    };
  } catch (error) {
    console.error("Get all orders error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve all orders",
      data: null,
    };
  }
};



const createOrder = async (userId: string, data: any) => {
  try {
    const { items, shippingAddress, notes } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        success: false,
        message: "Order must contain at least one item",
        data: null,
      };
    }

    let totalAmount = 0;
    let discount = 0;

    for (const item of items) {
      const sellerMedicine = await prisma.sellerMedicine.findUnique({
        where: { id: item.sellerMedicineId },
        include: { medicine: true },
      });

      if (!sellerMedicine) {
        return {
          statusCode: 400,
          success: false,
          message: `Invalid item: ${item.sellerMedicineId}`,
          data: null,
        };
      }

      if (!sellerMedicine.isAvailable) {
        return {
          statusCode: 400,
          success: false,
          message: `${sellerMedicine.medicine.name} is not available`,
          data: null,
        };
      }

      if (sellerMedicine.stockQuantity < item.quantity) {
        return {
          statusCode: 400,
          success: false,
          message: `Insufficient stock for ${sellerMedicine.medicine.name}. Available: ${sellerMedicine.stockQuantity}`,
          data: null,
        };
      }

      const itemPrice = sellerMedicine.price * item.quantity;
      const itemDiscount = sellerMedicine.discount * item.quantity;

      totalAmount += itemPrice;
      discount += itemDiscount;
    }

    const finalAmount = totalAmount - discount;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          totalAmount,
          discount,
          finalAmount,
          shippingAddress,
          notes,
          paymentMethod: "COD", 
          status: OrderStatus.PROCESSING,
        },
      });

      for (const item of items) {
        const sellerMedicine = await tx.sellerMedicine.findUnique({
          where: { id: item.sellerMedicineId },
        });

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            sellerMedicineId: item.sellerMedicineId,
            price: sellerMedicine!.price,
            quantity: item.quantity,
            discount: sellerMedicine!.discount * item.quantity,
            subtotal: sellerMedicine!.price * item.quantity,
          },
        });

        await tx.sellerMedicine.update({
          where: { id: item.sellerMedicineId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }
      await tx.orderLog.create({
        data: {
          orderId: newOrder.id,
          status: OrderStatus.PROCESSING,
          notes: "Order placed successfully",
        },
      });

      return newOrder;
    });

    return {
      statusCode: 201,
      success: true,
      message: "Order created successfully",
      data: order,
    };
  } catch (error) {
    console.error("Create order error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to create order",
      data: null,
    };
  }
};

const getUserOrders = async (userId: string) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            sellerMedicine: {
              include: {
                medicine: true,
              },
            },
          },
        },
        orderLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    };
  } catch (error) {
    console.error("Get user orders error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve orders",
      data: null,
    };
  }
};

const getOrderDetails = async (
  orderId: string,
  userId: string,
  userRole: UserRole,
) => {
  try {
    const id: any = { id: orderId };

    if (userRole !== UserRole.ADMIN) {
      if (userRole === UserRole.CUSTOMER) {
        id.userId = userId;
      } else if (userRole === UserRole.SELLER) {
        id.items = {
          some: {
            sellerMedicine: {
              sellerId: userId,
            },
          },
        };
      }
    }

    const order = await prisma.order.findFirst({
      where: id,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            sellerMedicine: {
              include: {
                medicine: true,
                seller: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        orderLogs: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return {
        statusCode: 404,
        success: false,
        message: "Order not found or you don't have permission to view it",
        data: null,
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Order details retrieved successfully",
      data: order,
    };
  } catch (error) {
    console.error("Get order details error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve order details",
      data: null,
    };
  }
};

const getSellerOrders = async (sellerId: string) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            sellerMedicine: {
              sellerId,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          where: {
            sellerMedicine: {
              sellerId,
            },
          },
          include: {
            sellerMedicine: {
              include: {
                medicine: true,
              },
            },
          },
        },
        orderLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Seller orders retrieved successfully",
      data: orders,
    };
  } catch (error) {
    console.error("Get seller orders error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve seller orders",
      data: null,
    };
  }
};

const updateOrderStatus = async (
  orderId: string,
  sellerId: string,
  status: OrderStatus,
  notes?: string,
) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            sellerMedicine: {
              sellerId,
            },
          },
        },
      },
    });

    if (!order) {
      return {
        statusCode: 404,
        success: false,
        message: "Order not found or you don't have permission to update it",
        data: null,
      };
    }

    if (order.status === OrderStatus.CANCELLED) {
      return {
        statusCode: 400,
        success: false,
        message: "Cannot update cancelled order",
        data: null,
      };
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      await tx.orderLog.create({
        data: {
          orderId,
          status,
          notes: notes || `Status updated to ${status}`,
        },
      });

      return order;
    });

    return {
      statusCode: 200,
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    };
  } catch (error) {
    console.error("Update order status error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to update order status",
      data: null,
    };
  }
};

// Cancel by customer
const cancelOrder = async (orderId: string, userId: string) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return {
        statusCode: 404,
        success: false,
        message: "Order not found",
        data: null,
      };
    }

    if (order.status !== OrderStatus.PROCESSING) {
      return {
        statusCode: 400,
        success: false,
        message: `Cannot cancel order. Current status: ${order.status}`,
        data: null,
      };
    }

    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.orderLog.create({
        data: {
          orderId,
          status: OrderStatus.CANCELLED,
          notes: "Order cancelled by customer",
        },
      });

      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
        include: { sellerMedicine: true },
      });

      for (const item of orderItems) {
        await tx.sellerMedicine.update({
          where: { id: item.sellerMedicineId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }

      return updatedOrder;
    });

    return {
      statusCode: 200,
      success: true,
      message: "Order cancelled successfully",
      data: cancelledOrder,
    };
  } catch (error) {
    console.error("Cancel order error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to cancel order",
      data: null,
    };
  }
};

const trackOrder = async (
  orderNumber: string,
  userId?: string,
  userRole?: UserRole,
) => {
  try {
    const id: any = { orderNumber };

    if (userId && userRole !== UserRole.ADMIN) {
      if (userRole === UserRole.CUSTOMER) {
        id.userId = userId;
      } else if (userRole === UserRole.SELLER) {
        id.items = {
          some: {
            sellerMedicine: {
              sellerId: userId,
            },
          },
        };
      }
    }

    const order = await prisma.order.findFirst({
      where: id,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        shippingAddress: true,
        orderLogs: {
          orderBy: { createdAt: "asc" },
          select: {
            status: true,
            notes: true,
            createdAt: true,
          },
        },
        items: {
          select: {
            quantity: true,
            sellerMedicine: {
              select: {
                medicine: {
                  select: {
                    name: true,
                    thumbnail: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return {
        statusCode: 404,
        success: false,
        message: "Order not found or you don't have permission to view it",
        data: null,
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Order tracking information retrieved",
      data: order,
    };
  } catch (error) {
    console.error("Track order error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to track order",
      data: null,
    };
  }
};

export const orderService = {
  getAllOrders,
  createOrder,
  getUserOrders,
  getOrderDetails,
  getSellerOrders,
  updateOrderStatus,
  cancelOrder,
  trackOrder,
};
