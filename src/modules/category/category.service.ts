import { prisma } from "../../lib/prisma";

interface CreateCategoryPayload {
  name: string;
  description?: string;
  image?: string;
}

interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

//todo done
const createCategory = async (payload: CreateCategoryPayload) => {
  try {
    const { name, description, image } = payload;

    if (!name?.trim()) {
      return {
        success: false,
        statusCode: 400,
        message: "Category name is required",
        data: null,
      };
    }

    // slugs > name
    const slug = generateSlug(name.trim());

    const existingCategory = await prisma.medicineCategory.findFirst({
      where: {
        OR: [{ name: name.trim() }, { slug: slug }],
      },
    });

    if (existingCategory) {
      return {
        success: false,
        statusCode: 409,
        message:
          existingCategory.name === name.trim()
            ? "Category with this name already exists"
            : "Category with similar name already exists",
        data: null,
      };
    }

    const category = await prisma.medicineCategory.create({
      data: {
        name: name.trim(),
        slug: slug,
        description: description?.trim() || null,
        image: image || null,
      },
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
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { medicines: true },
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
    data: { totalCategories, categories: formattedCategories },
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

const updateCategory = async (id: string, payload: UpdateCategoryPayload) => {
  try {
    if (!id) {
      return {
        success: false,
        statusCode: 400,
        message: "Category ID is required",
        data: null,
      };
    }

    const existingCategory = await prisma.medicineCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return {
        success: false,
        statusCode: 404,
        message: "Category not found",
        data: null,
      };
    }
    const updateData: any = {};

    if (payload.name !== undefined) {
      const newName = payload.name.trim();
      updateData.name = newName;

      const newSlug = generateSlug(newName);
      updateData.slug = newSlug;

      const duplicateCategory = await prisma.medicineCategory.findFirst({
        where: {
          OR: [{ name: newName }, { slug: newSlug }],
          NOT: { id },
        },
      });

      if (duplicateCategory) {
        return {
          success: false,
          statusCode: 409,
          message:
            duplicateCategory.name === newName
              ? "Another category already exists with this name"
              : "Another category already exists with similar name",
          data: null,
        };
      }
    }

    if (payload.description !== undefined) {
      updateData.description = payload.description.trim();
    }

    if (payload.image !== undefined) {
      updateData.image = payload.image;
    }

    if (payload.isActive !== undefined) {
      updateData.isActive = payload.isActive;
    }

    const updatedCategory = await prisma.medicineCategory.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      statusCode: 200,
      message: "Category updated successfully",
      data: updatedCategory,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to update category",
      data: null,
    };
  }
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  deleteSingleCategory,
  updateCategory,
};
