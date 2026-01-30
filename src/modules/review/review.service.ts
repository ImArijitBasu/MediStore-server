import { prisma } from "../../lib/prisma";


const createReview = async (
  userId: string,
  medicineId: string,
  orderId: string,
  rating: number,
  comment?: string,
) => {
  try {
    if (rating < 1 || rating > 5) {
      return {
        statusCode: 400,
        success: false,
        message: "Rating must be between 1 and 5",
        data: null,
      };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
        status: "DELIVERED", 
        items: {
          some: {
            sellerMedicine: {
              medicineId: medicineId,
            },
          },
        },
      },
    });

    if (!order) {
      return {
        statusCode: 400,
        success: false,
        message: "You can only review medicines from your delivered orders",
        data: null,
      };
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        medicineId,
        orderId,
      },
    });

    if (existingReview) {
      return {
        statusCode: 400,
        success: false,
        message: "You have already reviewed this medicine from this order",
        data: null,
      };
    }

    const review = await prisma.review.create({
      data: {
        userId,
        medicineId,
        orderId,
        rating,
        comment: comment ?? null,
        isVerified: true, 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const medicineReviews = await prisma.review.findMany({
      where: { medicineId },
    });

    const totalRating = medicineReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / medicineReviews.length;

    await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        rating: averageRating,
        totalRatings: medicineReviews.length,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: "Review submitted successfully",
      data: review,
    };
  } catch (error) {
    console.error("Create review error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to create review",
      data: null,
    };
  }
};

const getMedicineReviews = async (medicineId: string) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        medicineId,
        isVerified: true, 
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    };
  } catch (error) {
    console.error("Get reviews error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve reviews",
      data: null,
    };
  }
};

export const reviewService = {
  createReview,
  getMedicineReviews,
};
