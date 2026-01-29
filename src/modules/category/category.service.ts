import { prisma } from "../../lib/prisma";

interface CreateCategoryPayload {
  name: string;
  slug: string;
}
//todo done
const createCategory = async (payload: CreateCategoryPayload) => {
  try {
    const { name, slug } = payload;

    if (!name?.trim() || !slug?.trim()) {
      return {
        success: false,
        statusCode: 400,
        message: "Name and slug are required",
        data: null,
      };
    }

    const existingCategory = await prisma.medicineCategory.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existingCategory) {
      return {
        success: false,
        statusCode: 409,
        message: "Category already exists with same name or slug",
        data: null,
      };
    }

    const category = await prisma.medicineCategory.create({
      data: { name: name.trim(), slug: slug.trim() },
    });

    return {
      success: true,
      statusCode: 201,
      message: "Category created successfully",
      data: category,
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to create category",
      data: null,
    };
  }
};

//todo done
const getAllCategories = async () => {
  const categories = await prisma.medicineCategory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { medicines: true }, // count medicines in each category
      },
    },
  });

  const formattedCategories = categories.map((cat) => ({
    ...cat,
    medicineCount: cat._count.medicines,
    _count: undefined,
  }));

  const totalCategories = await prisma.medicineCategory.count();
  console.log(totalCategories);
  return {
    success: true,
    statusCode: 200,
    message: "Categories fetched successfully",
    data: {totalCategories, categories: formattedCategories },
  };
};
//todo done
const getSingleCategory = async (id: string) => {
  if (!id) {
    return {
      success: false,
      statusCode: 400,
      message: "Category id is required",
      data: null,
    };
  }

  const category = await prisma.medicineCategory.findUnique({
    where: { id },
    include: {
      medicines: true,
    },
  });

  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: "Category not found",
      data: null,
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Category fetched successfully",
    data: category,
  };
};
//todo done
const deleteSingleCategory = async (id: string) => {
  try {
    // check if category has medicines
    const medicinesCount = await prisma.medicine.count({
      where: {
        categoryId: id,
      },
    });

    if (medicinesCount > 0) {
      return {
        success: false,
        message: `Cannot delete category. It has ${medicinesCount} medicine(s) associated. Move or delete the medicines first.`,
        data: null,
        statusCode: 400,
      };
    }

    // If no medicines, delete the category
    const deletedCategory = await prisma.medicineCategory.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
      statusCode: 200,
    };
  } catch (error) {
    // Handle other errors
    let message = "Failed to delete category";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        message = "Cannot delete category with associated medicines";
        statusCode = 400;
      } else if (error.message.includes("Record to delete does not exist")) {
        message = "Category not found";
        statusCode = 404;
      }
    }

    return {
      success: false,
      message,
      data: null,
      statusCode,
    };
  }
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  deleteSingleCategory,
};
