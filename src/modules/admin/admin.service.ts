import { UserRole, UserStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      image: true,
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: users,
  };
};

const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
          reviews: true,
          sellerMedicines: true,
        },
      },
    },
  });

  if (!user) {
    return {
      statusCode: 404,
      success: false,
      message: "User not found",
      data: null,
    };
  }

  return {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: user,
  };
};

const banUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      statusCode: 404,
      success: false,
      message: "User not found",
      data: null,
    };
  }

  if (user.role === UserRole.ADMIN) {
    return {
      statusCode: 403,
      success: false,
      message: "Cannot ban admin users",
      data: null,
    };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.BANNED },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: "User banned successfully",
    data: updatedUser,
  };
};

const unbanUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      statusCode: 404,
      success: false,
      message: "User not found",
      data: null,
    };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: "User unbanned successfully",
    data: updatedUser,
  };
};

import { getLast6MonthsBuckets } from "../../helpers/dateHelpers";

const getStats = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalCustomers,
    totalSellers,
    totalAdmins,
    activeUsers,
    bannedUsers,
    totalOrders,
    totalMedicines,
    totalCategories,
    payments,
    recentOrders,
    recentPayments,
    categoriesInfo,
    recentLogs,
    recentNewUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
    prisma.user.count({ where: { role: UserRole.SELLER } }),
    prisma.user.count({ where: { role: UserRole.ADMIN } }),
    prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
    prisma.user.count({ where: { status: UserStatus.BANNED } }),
    prisma.order.count(),
    prisma.medicine.count(),
    prisma.medicineCategory.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    }),
    prisma.payment.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, status: "PAID" },
      select: { createdAt: true, amount: true }
    }),
    prisma.medicineCategory.findMany({
      include: {
        _count: {
          select: { medicines: true }
        }
      }
    }),
    prisma.orderLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { order: { select: { orderNumber: true } } }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
  ]);

  const totalRevenue = payments._sum.amount || 0;

  // Compute monthly data
  const buckets = getLast6MonthsBuckets();
  
  const monthlyOrdersData = buckets.map(b => ({ name: b.name, orders: 0 }));
  recentOrders.forEach(o => {
    const monthName = o.createdAt.toLocaleString('en-US', { month: 'short' });
    const index = monthlyOrdersData.findIndex(m => m.name === monthName);
    if (index !== -1) monthlyOrdersData[index].orders++;
  });

  const revenueData = buckets.map(b => ({ name: b.name, revenue: 0 }));
  recentPayments.forEach(p => {
    const monthName = p.createdAt.toLocaleString('en-US', { month: 'short' });
    const index = revenueData.findIndex(m => m.name === monthName);
    if (index !== -1) revenueData[index].revenue += p.amount;
  });

  const categoryData = categoriesInfo.map(c => ({
    name: c.name,
    value: c._count.medicines
  })).filter(c => c.value > 0);

  // Compute recent activity
  const recentActivity = [
    ...recentLogs.map(log => ({
      action: `Order #${log.order.orderNumber} ${log.status.toLowerCase()}`,
      time: log.createdAt.toISOString(),
      type: "order"
    })),
    ...recentNewUsers.map(u => ({
      action: `New user ${u.name} registered`,
      time: u.createdAt.toISOString(),
      type: "user"
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  const stats = {
    users: {
      total: totalUsers,
      customers: totalCustomers,
      sellers: totalSellers,
      admins: totalAdmins,
      active: activeUsers,
      banned: bannedUsers,
    },
    platform: {
      revenue: totalRevenue,
      orders: totalOrders,
      medicines: totalMedicines,
      categories: totalCategories,
    },
    charts: {
      monthlyOrdersData,
      revenueData,
      categoryData,
      recentActivity
    }
  };

  return {
    statusCode: 200,
    success: true,
    message: "Platform stats retrieved successfully",
    data: stats,
  };
};

export const adminService = {
  getAllUsers,
  getUserById,
  banUser,
  unbanUser,
  getStats,
};
