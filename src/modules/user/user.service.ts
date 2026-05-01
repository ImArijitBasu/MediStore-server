import { OrderStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { getLast6MonthsBuckets } from "../../helpers/dateHelpers";

const getSellerStats = async (sellerId: string) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [totalMedicines, orderItemsCount, deliveredItems, recentOrderItems] = await Promise.all([
      prisma.sellerMedicine.count({
        where: { sellerId },
      }),
      prisma.orderItem.count({
        where: { sellerMedicine: { sellerId } },
      }),
      prisma.orderItem.aggregate({
        _sum: { subtotal: true },
        where: {
          sellerMedicine: { sellerId },
          order: { status: OrderStatus.DELIVERED },
        },
      }),
      prisma.orderItem.findMany({
        where: { 
          sellerMedicine: { sellerId },
          order: { createdAt: { gte: sixMonthsAgo } } 
        },
        include: { order: { select: { createdAt: true, status: true } } }
      })
    ]);

    const buckets = getLast6MonthsBuckets();
    
    const salesData = buckets.map(b => ({ name: b.name, sales: 0 }));
    const revenueData = buckets.map(b => ({ name: b.name, revenue: 0 }));

    recentOrderItems.forEach(item => {
      const monthName = item.order.createdAt.toLocaleString('en-US', { month: 'short' });
      
      const salesIndex = salesData.findIndex(m => m.name === monthName);
      if (salesIndex !== -1) salesData[salesIndex].sales++;

      if (item.order.status === OrderStatus.DELIVERED) {
        const revIndex = revenueData.findIndex(m => m.name === monthName);
        if (revIndex !== -1) revenueData[revIndex].revenue += item.subtotal;
      }
    });

    const stats = {
      medicines: totalMedicines,
      orders: orderItemsCount,
      revenue: deliveredItems._sum.subtotal || 0,
      charts: {
        salesData,
        revenueData
      }
    };

    return {
      statusCode: 200,
      success: true,
      message: "Seller stats retrieved successfully",
      data: stats,
    };
  } catch (error) {
    console.error("Get seller stats error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve seller stats",
      data: null,
    };
  }
};

const getCustomerStats = async (userId: string) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [totalOrders, pendingOrders, deliveredOrders, allOrders, recentDeliveredOrders] = await Promise.all([
      prisma.order.count({
        where: { userId },
      }),
      prisma.order.count({
        where: { userId, status: OrderStatus.PROCESSING },
      }),
      prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: { userId, status: OrderStatus.DELIVERED },
      }),
      prisma.order.findMany({
        where: { userId },
        select: { status: true }
      }),
      prisma.order.findMany({
        where: { userId, status: OrderStatus.DELIVERED, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true, finalAmount: true }
      })
    ]);

    const orderStatusCounts: Record<string, number> = {};
    allOrders.forEach(o => {
      orderStatusCounts[o.status] = (orderStatusCounts[o.status] || 0) + 1;
    });

    const orderStatusData = Object.entries(orderStatusCounts).map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value
    }));

    const buckets = getLast6MonthsBuckets();
    const spendingData = buckets.map(b => ({ name: b.name, spending: 0 }));

    recentDeliveredOrders.forEach(o => {
      const monthName = o.createdAt.toLocaleString('en-US', { month: 'short' });
      const index = spendingData.findIndex(m => m.name === monthName);
      if (index !== -1) spendingData[index].spending += o.finalAmount;
    });

    const stats = {
      totalOrders,
      pendingOrders,
      totalSpent: deliveredOrders._sum.finalAmount || 0,
      charts: {
        orderStatusData,
        spendingData
      }
    };

    return {
      statusCode: 200,
      success: true,
      message: "Customer stats retrieved successfully",
      data: stats,
    };
  } catch (error) {
    console.error("Get customer stats error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve customer stats",
      data: null,
    };
  }
};

export const userService = {
  getSellerStats,
  getCustomerStats,
};
