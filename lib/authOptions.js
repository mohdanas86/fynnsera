// lib/authOptions.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Add your own authentication logic here
        const user = { id: "1", name: "John Doe", email: "john@example.com" };
        if (user) {
          return user;
        }
        return null;
      },
    }),
    // ...add more providers here if needed
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Include the user id on the session object
      session.user.id = token.sub;
      return session;
    },
  },
};

export default authOptions;
