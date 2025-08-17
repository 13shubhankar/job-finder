// components/Navbar.js
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Heart, LogOut, User, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    setShowUserMenu(false);
  };

  const navigation = [
    { name: 'Search Jobs', href: '/', icon: Search },
    { name: 'My Favorites', href: '/favorites', icon: Heart },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl group-hover:bg-primary-600 dark:group-hover:bg-primary-500 transition-all shadow-md">
              <Image
                src="/logo.png"
                alt="JobFinder Logo"
                width={36}
                height={36}
                className="rounded-md"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Job<span className="text-primary-600 dark:text-primary-400">Finder</span>
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {session && (
              <div className="flex items-center space-x-6">
                {navigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium hover:scale-105"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Theme toggle wrapper to keep alignment consistent */}
            <div className="flex items-center h-10">
              <ThemeToggle />
            </div>

            {/* User Menu / Sign In Button */}
            {status === 'loading' ? (
              <span className="text-gray-500 italic">Loading...</span>
            ) : session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 hover:shadow-md"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={36}
                      height={36}
                      className="rounded-full ring-2 ring-transparent hover:ring-primary-500 transition-all"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.user.email}
                    </p>
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-fade-in origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {session.user.email}
                      </p>
                      {session.user.favoritesCount > 0 && (
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                          {session.user.favoritesCount} saved jobs
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="px-4 py-2 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-md"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="flex items-center h-10">
              <ThemeToggle />
            </div>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-expanded={showMobileMenu}
              aria-controls="mobile-menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-gray-200 dark:border-gray-800 pt-4 pb-4 animate-slide-up"
          >
            {status === 'loading' ? (
              <p className="px-2 text-gray-500">Loading...</p>
            ) : session ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3 px-2 py-3 border-b border-gray-200 dark:border-gray-800 mb-2">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-transparent hover:ring-primary-500 transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                {/* Navigation Links */}
                 <div className="flex items-center space-x-6">
                  {navigation.map((item) => {
                    const IconComponent = item.icon;
                    if (!session && item.name === "My Favorites") return null; // hide Favorites for guests
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium hover:scale-105"
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>


                {/* Sign Out */}
                <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-2 py-3 w-full text-left rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="px-2 pt-2">
                <button
                  onClick={() => {
                    signIn('google');
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-lg font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-md"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
