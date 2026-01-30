import { prisma } from "../lib/prisma";
import { UserRole } from "../../generated/prisma/enums";

const AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:5000";

async function seedAdmin() {
  try {
    const adminPayload = {
      name: "Admin",
      email: "medadmin@gmail.com",
      password: "password1234",
    };

    const res = await fetch(`${AUTH_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: process.env.APP_URL || "http://localhost:3000",
      },
      body: JSON.stringify(adminPayload),
    });

    const body = await res.json();

    if (!res.ok) {
      if (body?.error?.code === "USER_ALREADY_EXISTS") {
        console.log("⚠️ Admin already exists. Skipping creation.");
      } else {
        console.error("Auth signup failed:", body);
      }
      return;
    }

    console.log("Admin created via BetterAuth");

      const userId = body.user.id;
      
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: UserRole.ADMIN,
        emailVerified: true,
      },
    });

    console.log(" Admin role assigned successfully");
  } catch (err) {
    console.error(" seedAdmin failed");

    if (err instanceof Error) {
      console.error(err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
