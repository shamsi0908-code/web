"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { setSession, clearSession, getSession } from "@/lib/session";

// 1. Session Actions
export async function loginAs(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new Error("User not found");
  }
  await setSession(user.id);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function logout() {
  await clearSession();
  revalidatePath("/", "layout");
  return { success: true };
}

// 2. Order Actions
export async function createOrder({
  masterId,
  scheduledAt,
  address,
  description,
  totalPrice,
}: {
  masterId: string;
  scheduledAt: string;
  address: string;
  description: string;
  totalPrice: number;
}) {
  const session = await getSession();
  if (!session) {
    throw new Error("Необходимо авторизоваться");
  }

  // Create the order
  await prisma.order.create({
    data: {
      clientId: session.userId,
      masterId,
      status: "PENDING",
      scheduledAt: new Date(scheduledAt),
      address,
      description,
      totalPrice,
    },
  });

  revalidatePath("/client/dashboard");
  revalidatePath(`/master/dashboard`);
  return { success: true };
}

export async function updateOrderStatus(orderId: string, status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED") {
  const session = await getSession();
  if (!session) {
    throw new Error("Не авторизован");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { master: true },
  });

  if (!order) {
    throw new Error("Заказ не найден");
  }

  // Authorization check (Client, Master or Admin)
  const isMasterOwner = order.master.userId === session.userId;
  const isClientOwner = order.clientId === session.userId;
  const isAdmin = session.role === "ADMIN";

  if (!isMasterOwner && !isClientOwner && !isAdmin) {
    throw new Error("Нет прав для редактирования заказа");
  }

  // Update order
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  // If order is completed, increment ordersCount for Master
  if (status === "COMPLETED" && order.status !== "COMPLETED") {
    await prisma.masterProfile.update({
      where: { id: order.masterId },
      data: {
        ordersCount: {
          increment: 1,
        },
      },
    });
  }

  revalidatePath("/client/dashboard");
  revalidatePath("/master/dashboard");
  revalidatePath("/admin");
  revalidatePath(`/master/${order.masterId}`);
  return { success: true };
}

// 3. Review Actions
export async function createReview({
  orderId,
  rating,
  text,
}: {
  orderId: string;
  rating: number;
  text: string;
}) {
  const session = await getSession();
  if (!session) {
    throw new Error("Не авторизован");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { review: true },
  });

  if (!order) {
    throw new Error("Заказ не найден");
  }

  if (order.clientId !== session.userId) {
    throw new Error("Вы не являетесь заказчиком");
  }

  if (order.review) {
    throw new Error("Отзыв уже оставлен");
  }

  // Create review
  await prisma.review.create({
    data: {
      orderId,
      clientId: session.userId,
      masterId: order.masterId,
      text,
      rating,
    },
  });

  // Re-calculate rating & reviewsCount for the Master
  const reviews = await prisma.review.findMany({
    where: { masterId: order.masterId },
    select: { rating: true },
  });

  const reviewsCount = reviews.length;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount;

  await prisma.masterProfile.update({
    where: { id: order.masterId },
    data: {
      rating: parseFloat(avgRating.toFixed(2)),
      reviewsCount,
    },
  });

  revalidatePath("/client/dashboard");
  revalidatePath(`/master/${order.masterId}`);
  return { success: true };
}

// 4. Master Actions
export async function addPortfolioItem({
  masterProfileId,
  imageUrl,
  description,
}: {
  masterProfileId: string;
  imageUrl: string;
  description: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "MASTER") {
    throw new Error("Нет прав");
  }

  await prisma.masterPortfolio.create({
    data: {
      masterProfileId,
      imageUrl,
      description,
    },
  });

  revalidatePath("/master/dashboard");
  return { success: true };
}

export async function updateMasterPrice(masterProfileId: string, basePrice: number) {
  const session = await getSession();
  if (!session || session.role !== "MASTER") {
    throw new Error("Нет прав");
  }

  await prisma.masterProfile.update({
    where: { id: masterProfileId },
    data: { basePrice },
  });

  revalidatePath("/master/dashboard");
  return { success: true };
}

// 5. Admin / Promotion Actions
export async function togglePromotion(promotionId: string, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Только администратор может управлять акциями");
  }

  await prisma.promotion.update({
    where: { id: promotionId },
    data: { isActive },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteReview(reviewId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Только администратор может удалять отзывы");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Отзыв не найден");
  }

  // Delete review
  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Re-calculate rating
  const reviews = await prisma.review.findMany({
    where: { masterId: review.masterId },
    select: { rating: true },
  });

  const reviewsCount = reviews.length;
  const avgRating = reviewsCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount : 0;

  await prisma.masterProfile.update({
    where: { id: review.masterId },
    data: {
      rating: parseFloat(avgRating.toFixed(2)),
      reviewsCount,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/master/${review.masterId}`);
  return { success: true };
}

export async function createPromotion(title: string, description: string, discountText: string, categoryId?: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Нет прав");
  }

  await prisma.promotion.create({
    data: {
      title,
      description,
      discountText,
      categoryId: categoryId || null,
      isActive: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function createMaster({
  name,
  email,
  phone,
  categorySlug,
  basePrice,
  age,
  experienceYears,
  districts,
  description,
  certificates,
}: {
  name: string;
  email: string;
  phone: string;
  categorySlug: string;
  basePrice: number;
  age: number;
  experienceYears: number;
  districts: string[];
  description: string;
  certificates: string[];
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Нет прав");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new Error("Пользователь с таким email уже существует");
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });
  if (!category) {
    throw new Error("Категория не найдена");
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: "masterpassword",
      name,
      phone,
      role: "MASTER",
    },
  });

  await prisma.masterProfile.create({
    data: {
      userId: user.id,
      description: description || "Специалист по бытовым услугам",
      age,
      experienceYears,
      basePrice,
      districts: JSON.stringify(districts),
      certificates: JSON.stringify(certificates),
      isVip: false,
      categories: {
        connect: [{ id: category.id }],
      },
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin");
  return { success: true };
}

// 6. Real Authentication Actions
export async function loginUser({ email, password }: { email: string; password?: string }) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new Error("Пользователь с таким email не найден");
  }
  if (password && user.password !== password) {
    throw new Error("Неверный пароль");
  }
  await setSession(user.id);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function registerUser({
  name,
  email,
  phone,
  password,
  role,
  categorySlug,
  basePrice,
  experienceYears,
  description,
}: {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: "CLIENT" | "MASTER";
  categorySlug?: string;
  basePrice?: number;
  experienceYears?: number;
  description?: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new Error("Пользователь с таким email уже существует");
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: password || "password",
      name,
      phone,
      role,
    },
  });

  if (role === "MASTER") {
    if (!categorySlug) {
      throw new Error("Необходимо выбрать категорию для специалиста");
    }
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (!category) {
      throw new Error("Категория не найдена");
    }

    await prisma.masterProfile.create({
      data: {
        userId: user.id,
        description: description || "Специалист по бытовым услугам",
        age: 30,
        experienceYears: experienceYears || 3,
        basePrice: basePrice || 3000,
        districts: JSON.stringify(["Есиль", "Нура", "Сарыарка"]),
        certificates: JSON.stringify([]),
        isVip: false,
        categories: {
          connect: [{ id: category.id }],
        },
      },
    });
  }

  await setSession(user.id);
  revalidatePath("/", "layout");
  return { success: true };
}


