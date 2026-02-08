import { PrismaClient } from "@/generated/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { sendPasswordResetEmail } from "@/app/actions/email";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            return {
              data: {
                ...user,
                role: "admin",
              },
            };
          }
          return { data: user };
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false, // Don't allow users to set their own role
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      // Send password reset email using our email service
      await sendPasswordResetEmail(
        {
          firstName: user.name?.split(" ")[0] || "there",
          resetUrl: url,
          expiresInMinutes: 60, // 1 hour
        },
        user.email
      );
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour in seconds
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    nextCookies(),
    admin({
      adminRoles: ["admin"],
      impersonationSessionDuration: 60 * 60, // 1 hour
    }),
  ],
});
