"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, X } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sign in state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign up state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupOrg, setSignupOrg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(signupEmail, signupPassword, signupName, signupOrg || undefined);
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-2xl shadow-xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Tabs */}
        <div className="flex justify-center gap-10 border-b mb-6">
          <button
            onClick={() => { setTab("signin"); setError(""); }}
            className={`pb-2 font-medium ${
              tab === "signin"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab("signup"); setError(""); }}
            className={`pb-2 font-medium ${
              tab === "signup"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* SIGN IN */}
        {tab === "signin" && (
          <form onSubmit={handleLogin}>
            <h2 className="text-xl font-semibold text-center mb-6 text-gray-600">
              Welcome Back
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-800">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border rounded-lg p-3 mt-1 text-gray-700"
                />
              </div>
              <div>
                <label className="text-sm text-gray-800">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border rounded-lg p-3 mt-1 pr-10 text-gray-700"
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Log In"}
              </button>
            </div>
          </form>
        )}

        {/* SIGN UP */}
        {tab === "signup" && (
          <form onSubmit={handleRegister}>
            <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
              Create Account
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-800">Full Name</label>
                <input
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border rounded-lg p-3 mt-1 text-gray-700"
                />
              </div>
              <div>
                <label className="text-sm text-gray-800">Email</label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border rounded-lg p-3 mt-1 text-gray-700"
                />
              </div>
              <div>
                <label className="text-sm text-gray-800">Organization (optional)</label>
                <input
                  value={signupOrg}
                  onChange={(e) => setSignupOrg(e.target.value)}
                  placeholder="Your Company Name"
                  className="w-full border rounded-lg p-3 mt-1 text-gray-700"
                />
              </div>
              <div>
                <label className="text-sm text-gray-800">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border rounded-lg p-3 mt-1 pr-10 text-gray-700"
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
