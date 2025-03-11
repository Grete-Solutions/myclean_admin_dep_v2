// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      displayName: string;
    };
    idToken: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    displayName: string;
    idToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: string;
    displayName: string;
    idToken: string;
  }
}