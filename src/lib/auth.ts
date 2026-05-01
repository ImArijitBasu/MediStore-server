import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import "dotenv/config";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: true, // Must be true for SameSite: None
    crossSiteCookies: {
      enabled: true, // Enable this
      allowedOrigins: [process.env.APP_URL!, "http://localhost:3000"], // Your frontend URL
    },
    // Add this to ensure the browser accepts the cookie from a different domain
    cookieAttributes: {
      sameSite: "none",
      secure: true,
    },
    disableCSRFCheck: true,
  },

  trustedOrigins: [process.env.APP_URL!, "http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "CUSTOMER",
        required: false,
        input: true,
      },
      status: {
        type: "string",
        default: "ACTIVE",
        required: false,
        input: false,
      },
    },
  },
});
