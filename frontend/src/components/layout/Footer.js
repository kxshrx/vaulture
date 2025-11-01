import Link from "next/link";
import { Twitter, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-dark-500 border-t border-dark-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-neon-500 rounded-lg flex items-center justify-center shadow-neon-sm">
                <span className="text-dark-900 font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-white">Vaulture</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Secure digital marketplace with 45-second download links. Buy and
              sell digital products safely.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="text-gray-500 hover:text-neon-500 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-neon-500 transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-neon-500 transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/products"
                  className="text-gray-400 hover:text-neon-500 transition-colors"
                >
                  Browse Products
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-500 transition-colors cursor-not-allowed opacity-50"
                  onClick={(e) => e.preventDefault()}
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-500 transition-colors cursor-not-allowed opacity-50"
                  onClick={(e) => e.preventDefault()}
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-500 transition-colors cursor-not-allowed opacity-50"
                  onClick={(e) => e.preventDefault()}
                >
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* For Creators */}
          <div>
            <h3 className="font-semibold text-white mb-4">For Creators</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/profile"
                  className="text-gray-400 hover:text-neon-500 transition-colors"
                >
                  Become a Creator
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-500 transition-colors cursor-not-allowed opacity-50"
                  onClick={(e) => e.preventDefault()}
                >
                  Creator Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-500 transition-colors cursor-not-allowed opacity-50"
                  onClick={(e) => e.preventDefault()}
                >
                  Resources
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-500 transition-colors cursor-not-allowed opacity-50"
                  onClick={(e) => e.preventDefault()}
                >
                  Creator Support
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-500 transition-colors cursor-not-allowed opacity-50"
                  onClick={(e) => e.preventDefault()}
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-500 transition-colors cursor-not-allowed opacity-50"
                  onClick={(e) => e.preventDefault()}
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-neon-500 transition-colors cursor-not-allowed opacity-50"
                  onClick={(e) => e.preventDefault()}
                >
                  Security
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-neon-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-neon-500 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-dark-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Vaulture. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-neon-500 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-neon-500 transition-colors"
              >
                Terms
              </Link>
              <a
                href="#"
                className="text-gray-400 hover:text-neon-500 transition-colors cursor-not-allowed opacity-50"
                onClick={(e) => e.preventDefault()}
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
