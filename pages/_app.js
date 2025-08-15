// pages/_app.js

import '../styles/globals.css';

import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import ThemeProvider from '../components/ThemeProvider';

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}) {
  return (
    <>
      <SessionProvider session={session}>
        <Head>
          <title>JobFinder - Find Your Dream Job</title>
          <meta
            name="description"
            content="Search thousands of job opportunities from top companies worldwide. Save favorites and find your perfect career match."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="keywords"
            content="jobs, careers, employment, job search, hiring, remote work"
          />
          <meta name="author" content="JobFinder" />
          {/* Open Graph */}
          <meta property="og:title" content="JobFinder - Find Your Dream Job" />
          <meta
            property="og:description"
            content="Search thousands of job opportunities from top companies worldwide."
          />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="/og-image.jpg" />
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="JobFinder - Find Your Dream Job" />
          <meta
            name="twitter:description"
            content="Search thousands of job opportunities from top companies worldwide."
          />
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          {/* Theme Color */}
          <meta name="theme-color" content="#3b82f6" />
          <meta name="msapplication-TileColor" content="#3b82f6" />
        </Head>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}