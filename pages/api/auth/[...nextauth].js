// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectMongoDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectMongoDB();
          
          // Check if user exists
          let existingUser = await User.findByGoogleId(profile.sub);
          
          if (!existingUser) {
            // Create new user
            existingUser = await User.createFromGoogle({
              id: profile.sub,
              email: profile.email,
              name: profile.name,
              picture: profile.picture
            });
            console.log('New user created:', existingUser.email);
          } else {
            // Update existing user info in case it changed
            existingUser.email = profile.email;
            existingUser.name = profile.name;
            existingUser.image = profile.picture;
            await existingUser.save();
            console.log('Existing user updated:', existingUser.email);
          }
          
          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      try {
        await connectMongoDB();
        const user = await User.findOne({ email: session.user.email });
        
        if (user) {
          session.user.id = user._id.toString();
          session.user.googleId = user.googleId;
          session.user.favoritesCount = user.favorites.length;
        }
        
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    }
  },
  pages: {
    // This line was causing the issue by redirecting back to the home page.
    // We've removed it to allow NextAuth to use its default sign-in page.
    // signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});
