// modules/medicine/medicine.service.ts
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
const getAllMedicines = async (take = 50, skip = 0) => {
  try {
    const medicines = await prisma.medicine.findMany({
      where: { isActive: true },
      take,
      skip,
      orderBy: { createdAt: "desc" },
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
          take: 1, // Get cheapest available
          orderBy: { price: "asc" },
          select: {
            price: true,
            stockQuantity: true,
            seller: {
              select: {
                id: true,
                
              },
            },
          },
        },
      },
    });

    const total = await prisma.medicine.count({
      where: { isActive: true },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Medicines fetched successfully",
      data: { medicines, total },
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

    // Remove from seller's inventory
    await prisma.sellerMedicine.delete({
      where: { id: sellerMedicine.id },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Medicine removed from your inventory",
      data: null,
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete medicine",
      data: null,
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
