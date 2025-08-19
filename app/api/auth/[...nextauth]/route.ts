import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

 const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, 
  debug: process.env.NODE_ENV === "production",
  session: {
    strategy: "jwt",
    maxAge: 3000000,
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
          // This will cause session verification to fail, but won't automatically redirect
          return null;
        }

        try {
          console.log("Fetching user from backend... with id token", token);
          const resUser = await fetch(
            `https://myclean-backend-v2-775492522781.europe-west1.run.app/admin/get?email=${credentials.email}`,
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
            idToken: token, // Store the token in the user object
          } as User & { idToken: string };
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
        token.idToken = user.idToken; // Store the token in the JWT
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
        session.idToken = token.idToken as string; // Make the token available in the session
      }
            console.log('Final session data:', session);

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };