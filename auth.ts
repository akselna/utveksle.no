import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword, getUserByGoogleId, createUser, getUserById } from "./lib/users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Verify user credentials from database
        const user = await verifyPassword(email, password);

        if (!user) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth
      if (account?.provider === "google" && profile?.email) {
        try {
          // Check if user exists
          let dbUser = await getUserByGoogleId(account.providerAccountId);

          if (!dbUser) {
            // Create new user
            dbUser = await createUser({
              email: profile.email,
              name: profile.name || "User",
              google_id: account.providerAccountId,
              provider: "google",
            });
          }

          user.id = dbUser.id.toString();
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;

        // Fetch full user data from database
        const userId = parseInt(token.id as string);
        const dbUser = await getUserById(userId);

        if (dbUser) {
          session.user.study_program = dbUser.study_program;
          session.user.specialization = dbUser.specialization;
          session.user.study_year = dbUser.study_year;
          session.user.university = dbUser.university;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

// Re-export registerUser from lib/users for backwards compatibility
export { createUser as registerUser } from "./lib/users";
