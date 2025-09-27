import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Mock user data - in production this would come from database
const users = [
  {
    id: "1",
    email: "admin@handwerk.de",
    password: "$2b$10$example_hash", // In production: properly hashed password
    name: "System Administrator",
    role: "admin",
  },
  {
    id: "2",
    email: "hans@handwerk.de",
    password: "$2b$10$example_hash",
    name: "Hans Müller",
    role: "vertrieb",
  },
  {
    id: "3",
    email: "petra@handwerk.de",
    password: "$2b$10$example_hash",
    name: "Petra Schmidt",
    role: "projektleitung",
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = users.find((u) => u.email === credentials.email)
        if (!user) {
          return null
        }

        // In production: use bcrypt to compare passwords
        // const isPasswordValid = await compare(credentials.password, user.password)
        // For demo purposes, accept any password
        const isPasswordValid = true

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
