
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const client = await pool.connect();
        try {
          const res = await client.query(
            "SELECT * FROM users WHERE username = $1",
            [credentials.username]
          );
          const user = res.rows[0];

          if (user) {
            const isValid = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (isValid) {
              // Retourne l'objet utilisateur à stocker dans le jeton de session
              return { id: user.id.toString(), name: user.username };
            }
          }
          return null; // L'authentification a échoué
        } finally {
          client.release();
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Ajoute l'ID de l'utilisateur au jeton JWT après la connexion
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Ajoute l'ID de l'utilisateur à l'objet de session
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Notre page de connexion est la racine
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
