"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const { user, logout, isAuthenticated, isCreator } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  return (
    <>
      <nav className="backdrop-custom border-b border-dark-400 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-neon-500 rounded-lg flex items-center justify-center shadow-neon-sm group-hover:shadow-neon transition-all">
                <span className="text-dark-900 font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-white group-hover:text-neon-500 transition-colors">Vaulture</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/products"
                className="text-gray-300 hover:text-neon-500 transition-colors font-medium"
              >
                Browse
              </Link>

              {isAuthenticated() ? (
                <div className="flex items-center space-x-4">
                  {isCreator() && (
                    <>
                      <Link
                        href="/creator/dashboard"
                        className="text-gray-400 hover:text-neon-500 transition-colors"
                      >
                        Creator Dashboard
                      </Link>
                      <Link
                        href="/creator/analytics"
                        className="text-gray-400 hover:text-neon-500 transition-colors"
                      >
                        Analytics
                      </Link>
                      <Link
                        href="/creator/upload"
                        className="text-gray-400 hover:text-neon-500 transition-colors"
                      >
                        Upload Product
                      </Link>
                    </>
                  )}

                  <Link
                    href="/dashboard"
                    className="text-gray-400 hover:text-neon-500 transition-colors"
                  >
                    My Purchases
                  </Link>

                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-300 hover:text-neon-500 transition-colors">
                      <User size={20} />
                      <span>{user?.name}</span>
                    </button>

                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-dark-400 border border-dark-300 rounded-lg shadow-elevated opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-300 hover:text-neon-500"
                        >
                          Dashboard
                        </Link>
                        {isCreator() && (
                          <>
                            <Link
                              href="/creator/dashboard"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-300 hover:text-neon-500"
                            >
                              Creator Dashboard
                            </Link>
                            <Link
                              href="/creator/analytics"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-300 hover:text-neon-500"
                            >
                              Analytics
                            </Link>
                            <Link
                              href="/creator/upload"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-300 hover:text-neon-500"
                            >
                              Upload Product
                            </Link>
                          </>
                        )}
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-300 hover:text-neon-500"
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-300 hover:text-neon-500"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button variant="pink">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-neon-500 hover:bg-dark-400"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for digital products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-400 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            </form>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-dark-400 backdrop-custom">
            <div className="px-4 py-3 space-y-3">
              <Link
                href="/products"
                className="block text-gray-300 hover:text-neon-500"
              >
                Browse Products
              </Link>

              {isAuthenticated() ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block text-gray-300 hover:text-neon-500"
                  >
                    My Purchases
                  </Link>
                  {isCreator() && (
                    <>
                      <Link
                        href="/creator/dashboard"
                        className="block text-gray-300 hover:text-neon-500"
                      >
                        Creator Dashboard
                      </Link>
                      <Link
                        href="/creator/analytics"
                        className="block text-gray-300 hover:text-neon-500"
                      >
                        Analytics
                      </Link>
                      <Link
                        href="/creator/upload"
                        className="block text-gray-300 hover:text-neon-500"
                      >
                        Upload Product
                      </Link>
                    </>
                  )}
                  <Link
                    href="/profile"
                    className="block text-gray-300 hover:text-neon-500"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left text-gray-300 hover:text-neon-500"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button variant="pink" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
