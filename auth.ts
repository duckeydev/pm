import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      authorization: {
        params: {
          scope: "repo read:org read:user user:email",
        },
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      const login = (profile as { login?: string } | undefined)?.login
      if (login) {
        token.login = login
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined
      if (session.user) {
        session.user.login =
          typeof token.login === "string" ? token.login : undefined
      }
      return session
    },
  },
})
