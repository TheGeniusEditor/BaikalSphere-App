"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import AuthModal from "./AuthModal";
import { useAuth } from "./AuthProvider";
import { useState } from "react";

export default function Navbar() {

  const [showAuth, setShowAuth] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLink = (path: string) =>
    `pb-1 transition-colors ${
      pathname === path
        ? "text-blue-600 border-b-2 border-blue-600"
        : "text-gray-700 hover:text-blue-600"
    }`;

  return (
     <>
    <header className="border-b bg-[#f3f4f6] sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between py-4">

        
        <Logo />

        
        <nav className="flex items-center gap-10 font-bold">

          
          <Link href="/" className={navLink("/")}>
            Home
          </Link>

          
          <div className="relative group">

            <button
              className={`pb-1 ${
                pathname.startsWith("/products")
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Products
            </button>

            
            <div className="absolute left-0 top-full pt-3 hidden group-hover:block z-50">
              <div className="w-[380px] bg-white shadow-xl rounded-xl p-6 space-y-6">

                <Link
                  href="/products/datasphere"
                  className="block hover:bg-gray-50 p-2 rounded-md"
                >
                  <h4 className="font-semibold text-gray-900">
                    DataSphere
                  </h4>
                  <p className="text-sm text-gray-500">
                    Unified semantic data intelligence layer
                  </p>
                </Link>

                <Link
                  href="/products/workforce-management"
                  className="block hover:bg-gray-50 p-2 rounded-md"
                >
                  <h4 className="font-semibold text-gray-900">
                    Workforce Management
                  </h4>
                  <p className="text-sm text-gray-500">
                    AI-driven scheduling & compliance
                  </p>
                </Link>

                <Link
                  href="/products/fincore"
                  className="block hover:bg-gray-50 p-2 rounded-md"
                >
                  <h4 className="font-semibold text-gray-900">
                    FinCore
                  </h4>
                  <p className="text-sm text-gray-500">
                    Financial data lakehouse & reconciliation
                  </p>
                </Link>

                <Link
                  href="/products/data-sharing"
                  className="block hover:bg-gray-50 p-2 rounded-md"
                >
                  <h4 className="font-semibold flex items-center gap-2">
                    Enterprise Data Sharing Platform
                    <span className="text-blue-600">↗</span>
                  </h4>
                  <p className="text-sm text-gray-500">
                    Secure data sharing & downloads
                  </p>
                </Link>

              </div>
            </div>

          </div>

          
          <Link href="/platforms" className={navLink("/platforms")}>
            Platforms
          </Link>

          
          <Link href="/industries" className={navLink("/industries")}>
            Industries
          </Link>

          
          <Link href="/about" className={navLink("/about")}>
            About Us
          </Link>

          
          <Link href="/contact" className={navLink("/contact")}>
            Contact
          </Link>

        </nav>

        
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                Dashboard
              </Link>
              <span className="text-sm text-gray-700 font-medium">{user.fullName}</span>
              <button
                onClick={() => logout()}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-md"
            >
              Sign In
            </button>
          )}

        </div>
        </header>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
  );
}