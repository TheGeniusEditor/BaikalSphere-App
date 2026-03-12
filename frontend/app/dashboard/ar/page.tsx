"use client";

import { useAuth } from "@/components/AuthProvider";
import { getAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * AR module redirect page.
 * When a user clicks "Open module" for AR on the dashboard,
 * they land here. This page passes the Baikalsphere access token
 * to the AR frontend so it can authenticate API calls.
 */
export default function ArRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (!user.modules.includes("ar")) {
      setError("You don't have access to the AR module.");
      return;
    }

    // Get the current access token and redirect to AR frontend with it
    const token = getAccessToken();
    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }

    // Resolve which portal (hotel-finance or corporate-portal) this user belongs to
    const arApiUrl = process.env.NEXT_PUBLIC_AR_API_URL || "http://localhost:4000";
    const arBaseUrl = process.env.NEXT_PUBLIC_AR_URL || "http://localhost:3001";

    fetch(`${arApiUrl}/api/auth/resolve-portal`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const portal = data.portal || "hotel-finance";
        window.location.href = `${arBaseUrl}/${portal}?token=${encodeURIComponent(token)}`;
      })
      .catch(() => {
        // Fallback to hotel-finance if resolve fails
        window.location.href = `${arBaseUrl}/hotel-finance?token=${encodeURIComponent(token)}`;
      });
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <p className="text-red-700 text-lg font-medium">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-500">Redirecting to Accounts Receivable...</p>
      </div>
    </div>
  );
}
