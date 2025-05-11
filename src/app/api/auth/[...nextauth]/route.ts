import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

interface UserSession extends Session {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Login failed: Missing email or password");
          throw new Error("Please provide email and password");
        }

        await dbConnect();
        console.log("📊 MongoDB connected successfully for login");

        // Find user by email
        const user = await User.findOne({ email: credentials.email }).select("+password");

        if (!user) {
          console.log("❌ Login failed: User not found:", credentials.email);
          throw new Error("Invalid credentials");
        }

        // Check if password matches
        const isPasswordMatch = await user.matchPassword(credentials.password);

        if (!isPasswordMatch) {
          console.log("❌ Login failed: Invalid password for user:", credentials.email);
          throw new Error("Invalid credentials");
        }

        console.log("✅ Login successful for user:", credentials.email);
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // @ts-expect-error - user.id exists but TypeScript doesn't know it
        token.id = user.id;
        console.log("🔑 JWT token created for user:", user.email);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // @ts-expect-error - we're adding id to the session
        session.user.id = token.id;
        console.log("🔄 Session updated for user:", session.user.email);
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },
  },
});

export { handler as GET, handler as POST }; 