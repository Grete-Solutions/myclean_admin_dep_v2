import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter email" },
        password: { label: "Password", type: "password" },
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          console.error("No credentials provided");
          throw new Error("No credentials provided");
        }

        const token = credentials.idToken;
        if (!token) {
          console.error("No authentication token provided");
          throw new Error("No authentication token provided");
        }

        try {
          console.log("Fetching user from backend...");
          const resUser = await fetch(
            `https://myclean-backend-v2.onrender.com/admin/get?email=${credentials.email}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("Response status:", resUser.status);

          const response = await resUser.json();
          console.log("Fetched user data:", response);

          if (!response.success || !response.data || response.data.length === 0) {
            console.error("User not found or is deactivated/suspended.");
            throw new Error("User not found or is deactivated/suspended.");
          }

          const user = response.data[0]; // Extract the first user from the array

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.displayName,
            role: user.role,
            displayName: user.displayName,
          } as User;
        } catch (error) {
          console.error("Error during authorization:", error);
          throw new Error("Authentication failed.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.displayName = user.displayName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.displayName = token.displayName as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
