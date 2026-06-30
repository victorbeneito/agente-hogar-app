import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        password: { label: "Contraseña", type: "password" },
      },
      authorize(credentials) {
        if (
          typeof credentials?.password === "string" &&
          credentials.password.length > 0 &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "admin", name: "Admin" };
        }
        return null;
      },
    }),
  ],
});
