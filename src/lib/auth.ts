import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
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
      allowedOrigins: [process.env.APP_URL!], // Your frontend URL
    },
    // Add this to ensure the browser accepts the cookie from a different domain
    cookieAttributes: {
      sameSite: "none",
      secure: true,
    },
    disableCSRFCheck: true,
  },

  trustedOrigins: [process.env.APP_URL!],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
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
