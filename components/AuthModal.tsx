"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

export default function AuthModal({ onClose }: any) {
  const [tab, setTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[420px] rounded-2xl shadow-xl p-8 relative">

       
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500"
        >
          <X size={20} />
        </button>

      
        <div className="flex justify-center gap-10 border-b mb-6">

          <button
            onClick={() => setTab("signin")}
            className={`pb-2 font-medium ${
              tab === "signin"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => setTab("signup")}
            className={`pb-2 font-medium ${
              tab === "signup"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Sign Up
          </button>

        </div>

        {/* SIGN IN */}
        {tab === "signin" && (
          <div>

            <h2 className="text-xl font-semibold text-center mb-6 text-gray-600">
              Welcome Back
            </h2>

            <div className="space-y-4">

              <div>
                <label className="text-sm text-gray-800">Email</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full border rounded-lg p-3 mt-1 text-gray-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-800">Password</label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full border rounded-lg p-3 mt-1 pr-10 text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-4 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                Log In
              </button>

            </div>

          </div>
        )}

        {/* SIGN UP */}
        {tab === "signup" && (
          <div>

            <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
              Create Account
            </h2>

            <div className="space-y-4">

              <div>
                <label className="text-sm text-gray-800">Full Name</label>
                <input
                  placeholder="John Doe"
                  className="w-full border rounded-lg p-3 mt-1 text-gray-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-800">Email</label>
                <input
                  placeholder="name@company.com"
                  className="w-full border rounded-lg p-3 mt-1 text-gray-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-800">Password</label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full border rounded-lg p-3 mt-1 pr-10 text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-4 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

                </div>

              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                Create Account
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}