import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectMongoDB from "../../../lib/mongodb";
import User from "../../../models/User";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    // First sign-in or returning user
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectMongoDB();

          // Check user by Google ID or Email
          let existingUser =
            (await User.findOne({ googleId: profile.sub })) ||
            (await User.findOne({ email: profile.email }));

          if (!existingUser) {
            // Create new user
            existingUser = await User.create({
              googleId: profile.sub,
              email: profile.email,
              name: profile.name,
              image: profile.picture,
            });
            console.log("✅ New user created:", existingUser.email);
          } else {
            // Update existing user
            existingUser.googleId = profile.sub;
            existingUser.email = profile.email;
            existingUser.name = profile.name;
            existingUser.image = profile.picture;
            await existingUser.save();
            console.log("🔄 Existing user updated:", existingUser.email);
          }

          return true;
        } catch (error) {
          console.error("❌ Error during sign in:", error);
          return false;
        }
      }
      return true;
    },

    // Add DB user info into JWT
    async jwt({ token, user }) {
      if (user) {
        await connectMongoDB();
        const dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.googleId = dbUser.googleId;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.image = dbUser.image;
        }
      }
      return token;
    },

    // Attach custom fields to client session
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          googleId: token.googleId,
          name: token.name,
          email: token.email,
          image: token.image,
        };
      }
      return session;
    },
  },

  pages: {
    error: "/", // redirect errors to home
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET, // ✅ keep only this
  debug: process.env.NODE_ENV === "development",
});
