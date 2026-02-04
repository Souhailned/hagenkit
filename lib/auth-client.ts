import { createAuthClient } from "better-auth/react";
import { lastLoginMethodClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [lastLoginMethodClient(), adminClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
