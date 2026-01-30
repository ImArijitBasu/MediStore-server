import { prisma } from "../../lib/prisma";


const getOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findFirst({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  return cart;
};


const addToCart = async (
  userId: string,
  sellerMedicineId: string,
  quantity: number = 1,
) => {
  try {
    const sellerMedicine = await prisma.sellerMedicine.findUnique({
      where: { id: sellerMedicineId },
      include: { medicine: true },
    });

    if (!sellerMedicine) {
      return {
        statusCode: 404,
        success: false,
        message: "Medicine not found",
        data: null,
      };
    }

    if (!sellerMedicine.isAvailable) {
      return {
        statusCode: 400,
        success: false,
        message: "This medicine is currently unavailable",
        data: null,
      };
    }

    if (sellerMedicine.stockQuantity < quantity) {
      return {
        statusCode: 400,
        success: false,
        message: `Insufficient stock. Only ${sellerMedicine.stockQuantity} available`,
        data: null,
      };
    }

    const cart = await getOrCreateCart(userId);

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        sellerMedicineId,
      },
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      if (sellerMedicine.stockQuantity < newQuantity) {
        return {
          statusCode: 400,
          success: false,
          message: `Cannot add ${quantity} more. Total would exceed available stock of ${sellerMedicine.stockQuantity}`,
          data: null,
        };
      }

      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });

      return {
        statusCode: 200,
        success: true,
        message: "Cart item quantity updated",
        data: updatedCartItem,
      };
    } else {
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          sellerMedicineId,
          quantity,
        },
      });

      return {
        statusCode: 201,
        success: true,
        message: "Item added to cart",
        data: cartItem,
      };
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to add item to cart",
      data: null,
    };
  }
};

const getCart = async (userId: string) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            sellerMedicine: {
              include: {
                medicine: {
                  select: {
                    id: true,
                    name: true,
                    thumbnail: true,
                    brandName: true,
                    genericName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        statusCode: 200,
        success: true,
        message: "Cart is empty",
        data: {
          cartId: cart?.id || null,
          items: [],
          summary: {
            totalItems: 0,
            totalAmount: 0,
            totalDiscount: 0,
            finalAmount: 0,
          },
        },
      };
    }

    let totalItems = 0;
    let totalAmount = 0;
    let totalDiscount = 0;

    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const sellerMedicine = await prisma.sellerMedicine.findUnique({
          where: { id: item.sellerMedicineId },
        });

        const itemPrice = sellerMedicine!.price * item.quantity;
        const itemDiscount = sellerMedicine!.discount * item.quantity;

        totalItems += item.quantity;
        totalAmount += itemPrice;
        totalDiscount += itemDiscount;

        return {
          id: item.id,
          quantity: item.quantity,
          sellerMedicine: {
            id: item.sellerMedicine.id,
            price: sellerMedicine!.price,
            originalPrice: sellerMedicine!.originalPrice,
            discount: sellerMedicine!.discount,
            stockQuantity: sellerMedicine!.stockQuantity,
            isAvailable: sellerMedicine!.isAvailable,
            medicine: item.sellerMedicine.medicine,
          },
          subtotal: itemPrice,
          discount: itemDiscount,
        };
      }),
    );

    const finalAmount = totalAmount - totalDiscount;

    return {
      statusCode: 200,
      success: true,
      message: "Cart retrieved successfully",
      data: {
        cartId: cart.id,
        items: itemsWithDetails,
        summary: {
          totalItems,
          totalAmount,
          totalDiscount,
          finalAmount,
        },
      },
    };
  } catch (error) {
    console.error("Get cart error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve cart",
      data: null,
    };
  }
};

const updateCartItem = async (cartItemId: string, quantity: number) => {
  try {
    if (quantity < 1) {
      return {
        statusCode: 400,
        success: false,
        message: "Quantity must be at least 1",
        data: null,
      };
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        sellerMedicine: true,
      },
    });

    if (!cartItem) {
      return {
        statusCode: 404,
        success: false,
        message: "Cart item not found",
        data: null,
      };
    }

    if (cartItem.sellerMedicine.stockQuantity < quantity) {
      return {
        statusCode: 400,
        success: false,
        message: `Insufficient stock. Only ${cartItem.sellerMedicine.stockQuantity} available`,
        data: null,
      };
    }

    if (!cartItem.sellerMedicine.isAvailable) {
      return {
        statusCode: 400,
        success: false,
        message: "This medicine is no longer available",
        data: null,
      };
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Cart item updated",
      data: updatedCartItem,
    };
  } catch (error) {
    console.error("Update cart item error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to update cart item",
      data: null,
    };
  }
};

const removeCartItem = async (cartItemId: string) => {
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      return {
        statusCode: 404,
        success: false,
        message: "Cart item not found",
        data: null,
      };
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Item removed from cart",
      data: null,
    };
  } catch (error) {
    console.error("Remove cart item error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to remove item from cart",
      data: null,
    };
  }
};

const clearCart = async (userId: string) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      return {
        statusCode: 200,
        success: true,
        message: "Cart is already empty",
        data: null,
      };
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Cart cleared successfully",
      data: null,
    };
  } catch (error) {
    console.error("Clear cart error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to clear cart",
      data: null,
    };
  }
};

export const cartService = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
