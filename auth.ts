import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// TODO: Replace this with a real database
// For now, we'll use an in-memory array
// In production, you should use a database like PostgreSQL, MongoDB, etc.
const users: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
}> = [];

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

        // Find user by email
        const user = users.find((u) => u.email === email);

        if (!user) {
          return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

// Helper function to register new users
export async function registerUser(
  email: string,
  password: string,
  name: string
) {
  // Check if user already exists
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = {
    id: Math.random().toString(36).substring(7),
    email,
    password: hashedPassword,
    name,
  };

  users.push(newUser);

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
  };
}
