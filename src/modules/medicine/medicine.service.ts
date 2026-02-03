
import { prisma } from "../../lib/prisma";

interface CreateMedicinePayload {
  name: string;
  brandName: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  sellerId: string;
}

interface UpdateMedicinePayload {
  name?: string;
  brandName?: string;
  categoryId?: string;
}

export interface GetAllMedicinesFilters {
  search?: string;
  category?: string;
  manufacturer?: string;
  minPrice?: number;
  maxPrice?: number;
  take?: number;
  skip?: number;
  sortBy?: "price" | "name" | "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
}
interface UpdateSellerMedicinePayload {
  price?: number;
  stockQuantity?: number;
}

const createMedicine = async (payload: CreateMedicinePayload) => {
  try {
    const { name, brandName, price, stockQuantity, categoryId, sellerId } =
      payload;

    // Validation
    if (
      !name?.trim() ||
      !brandName?.trim() ||
      !categoryId?.trim() ||
      !sellerId?.trim()
    ) {
      return {
        statusCode: 400,
        success: false,
        message: "Name, brandName, categoryId, and sellerId are required",
        data: null,
      };
    }
    if (price <= 0 || stockQuantity < 0) {
      return {
        statusCode: 400,
        success: false,
        message: "Price must be > 0 and stockQuantity >= 0",
        data: null,
      };
    }

    // Check category
    const category = await prisma.medicineCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return {
        statusCode: 404,
        success: false,
        message: "Category not found",
        data: null,
      };
    }

    // Check seller exists and is a SELLER
    const seller = await prisma.user.findUnique({
      where: { id: sellerId, role: "SELLER" },
    });
    if (!seller) {
      return {
        statusCode: 403,
        success: false,
        message: "Seller not found or not authorized",
        data: null,
      };
    }

    // Create slug
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check for duplicate slug
    const existingSlug = await prisma.medicine.findUnique({
      where: { slug },
    });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    // Create medicine
    const medicine = await prisma.medicine.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        brandName: brandName.trim(),
        categoryId,
      },
    });

    // Create seller medicine
    const sellerMedicine = await prisma.sellerMedicine.create({
      data: {
        price,
        stockQuantity,
        sellerId,
        medicineId: medicine.id,
        isAvailable: stockQuantity > 0,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: "Medicine created successfully",
      data: {
        medicine,
        sellerMedicine,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message:
        error instanceof Error ? error.message : "Medicine creation failed",
      data: null,
    };
  }
};

// (Public)

const getAllMedicines = async (filters: GetAllMedicinesFilters = {}) => {
  try {
    const {
      search,
      category,
      manufacturer,
      minPrice,
      maxPrice,
      take = 50,
      skip = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brandName: { contains: search, mode: "insensitive" } },
        { genericName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Category 
    if (category) {
      where.categoryId = category;
    }

    // Manufacturer 
    if (manufacturer) {
      where.manufacturer = { contains: manufacturer, mode: "insensitive" };
    }

    // Price range filter 
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.sellers = {
        some: {
          isAvailable: true,
          price: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        },
      };
    }

    // Build ORDER BY clause
    const orderBy: any = {};

    if (sortBy !== "price") {
      orderBy[sortBy] = sortOrder;
    }

    const medicines = await prisma.medicine.findMany({
      where,
      take,
      skip,
      orderBy: sortBy === "price" ? undefined : orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        sellers: {
          where: { isAvailable: true },
          take: 1, 
          orderBy: { price: "asc" },
          select: {
            id: true,
            price: true,
            stockQuantity: true,
            discount: true,
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (sortBy === "price") {
      medicines.sort((a, b) => {
        const priceA = a.sellers[0]?.price || Infinity;
        const priceB = b.sellers[0]?.price || Infinity;
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      });
    }

    const total = await prisma.medicine.count({ where });

    return {
      statusCode: 200,
      success: true,
      message: "Medicines fetched successfully",
      data: {
        medicines,
        total,
        pagination: {
          page: Math.floor(skip / take) + 1,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
        filters: {
          applied: {
            search,
            category,
            manufacturer,
            minPrice,
            maxPrice,
          },
          sort: {
            by: sortBy,
            order: sortOrder,
          },
        },
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch medicines",
      data: null,
    };
  }
};

//(Public)
const getSingleMedicine = async (id: string) => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id, isActive: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        sellers: {
          where: { isAvailable: true },
          select: {
            id: true,
            price: true,
            stockQuantity: true,
            discount: true,
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        reviews: {
          take: 10,
          where: { isVerified: true },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!medicine) {
      return {
        statusCode: 404,
        success: false,
        message: "Medicine not found",
        data: null,
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Medicine fetched successfully",
      data: medicine,
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch medicine",
      data: null,
    };
  }
};

//Only price/stock for this seller
const updateSellerMedicine = async (
  medicineId: string,
  sellerId: string,
  payload: UpdateSellerMedicinePayload,
) => {
  try {
    // Check if seller has this medicine
    const sellerMedicine = await prisma.sellerMedicine.findFirst({
      where: {
        medicineId,
        sellerId,
      },
    });

    if (!sellerMedicine) {
      return {
        statusCode: 404,
        success: false,
        message: "Medicine not found in your inventory",
        data: null,
      };
    }

    const updatedSellerMedicine = await prisma.sellerMedicine.update({
      where: { id: sellerMedicine.id },
      data: {
        ...payload,
        isAvailable:
          payload.stockQuantity !== undefined
            ? payload.stockQuantity > 0
            : sellerMedicine.isAvailable,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Medicine updated successfully",
      data: updatedSellerMedicine,
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update medicine",
      data: null,
    };
  }
};

//Remove from seller's inventory
const deleteSellerMedicine = async (medicineId: string, sellerId: string) => {
  try {
    const sellerMedicine = await prisma.sellerMedicine.findFirst({
      where: { medicineId, sellerId },
    });

    if (!sellerMedicine) {
      return { statusCode: 404, success: false, message: "Listing not found" };
    }

    // Attempt permanent deletion
    await prisma.sellerMedicine.delete({
      where: { id: sellerMedicine.id },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Medicine permanently removed from your inventory",
    };
  } catch (error: any) {
    //  Foreign Key Constraint violation
    if (error.code === "P2003") {
      return {
        statusCode: 400,
        success: false,
        message:
          "Cannot delete: This medicine is linked to existing orders. Try hiding it instead.",
      };
    }

    return {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to delete medicine",
    };
  }
};

// GET SELLER'S MEDICINES
const getSellerMedicines = async (sellerId: string) => {
  try {
    const sellerMedicines = await prisma.sellerMedicine.findMany({
      where: { sellerId },
      include: {
        medicine: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Seller medicines fetched successfully",
      data: sellerMedicines,
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch seller medicines",
      data: null,
    };
  }
};

export const medicineService = {
  createMedicine,
  getAllMedicines,
  getSingleMedicine,
  updateSellerMedicine,
  deleteSellerMedicine,
  getSellerMedicines,
};
