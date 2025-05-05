import NextAuth, { Session } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

const handler = NextAuth({
    providers: [
        CredentialsProvider({
          name: 'Username',
          credentials: {
            email: { label: "Email", type: "text", placeholder: "Enter email" },
            password: { label: "Password", type: "password", placeholder: "Enter password" }
          },
          async authorize(credentials) {

            const user = await prisma.user.findFirst({
                where:{
                    email:credentials?.email,
                }
            })

            console.log("User found:", user)

            const isPasswordValid = credentials?.password && user?.password 
              ? await compare(credentials.password, user.password) 
              : false;

            if (isPasswordValid && user) {
              return user
            }
            return null
          }
        })
      ],
      callbacks: {
        session: ({ session, token }) => {
          if (session?.user) {
            (session.user as Session["user"] & { id: string }).id = token.sub!;
          }
          return session;
        }
      },
      pages: {
        signIn: '/login'
      },
      secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }