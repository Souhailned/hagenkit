import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { sendPasswordResetEmail } from "@/app/actions/email";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Better Auth admin plugin sets role="user" by default,
          // but our Prisma enum is seeker/agent/admin. Fix it here.
          const userCount = await prisma.user.count();
          const role = userCount === 0 ? "admin" : "seeker";
          return {
            data: {
              ...user,
              role,
            },
          };
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false, // Role is set server-side only (via setUserRole action or onboarding)
      },
      phone: {
        type: "string",
        required: false,
      },
      onboardingCompleted: {
        type: "boolean",
        required: false,
        input: false,
      },
      status: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(
        {
          firstName: user.name?.split(" ")[0] || "daar",
          resetUrl: url,
          expiresInMinutes: 60,
        },
        user.email
      );
    },
    resetPasswordTokenExpiresIn: 3600,
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
      adminRoles: ["admin"], // Maps to our UserRole.admin
      impersonationSessionDuration: 60 * 60,
    }),
  ],
});
