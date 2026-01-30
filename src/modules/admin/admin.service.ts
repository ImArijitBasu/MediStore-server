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

const getStats = async () => {
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
  ]);

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
      orders: totalOrders,
      medicines: totalMedicines,
      categories: totalCategories,
    },
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
