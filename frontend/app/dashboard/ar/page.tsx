"use client";

import { useAuth } from "@/components/AuthProvider";
import { getAccessToken, refreshAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type BaikalsphereArTokenPayload = {
  orgId?: string | null;
  platformRole?: string;
  modules?: string[];
};

const decodeTokenPayload = (token: string): BaikalsphereArTokenPayload | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(window.atob(padded)) as BaikalsphereArTokenPayload;
  } catch {
    return null;
  }
};

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

    const redirectToAr = async () => {
      let token = getAccessToken();
      if (!token) {
        token = await refreshAccessToken();
      }

      if (!token) {
        setError("Session expired. Please log in again.");
        return;
      }

      const tokenPayload = decodeTokenPayload(token);

      const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");
      const arBaseUrl = normalizeBaseUrl(
        process.env.NEXT_PUBLIC_AR_URL || process.env.NEXT_PUBLIC_AR_API_URL || "https://ar.baikalsphere.com"
      );
      const arApiUrl = normalizeBaseUrl(
        process.env.NEXT_PUBLIC_AR_API_URL || process.env.NEXT_PUBLIC_AR_URL || "https://ar.baikalsphere.com"
      );

      if (tokenPayload?.orgId) {
        window.location.href = `${arBaseUrl}/corporate-portal?token=${encodeURIComponent(token)}`;
        return;
      }

      try {
        const response = await fetch(`${arApiUrl}/api/auth/resolve-portal`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = data?.error?.message || "Failed to resolve AR portal.";
          if (typeof message === "string" && message.toLowerCase().includes("corporate portal")) {
            window.location.href = `${arBaseUrl}/corporate-portal?token=${encodeURIComponent(token)}`;
            return;
          }
          window.location.href = `${arBaseUrl}/hotel-finance?token=${encodeURIComponent(token)}`;
          return;
        }

        const portal = data?.portal || "hotel-finance";
        window.location.href = `${arBaseUrl}/${portal}?token=${encodeURIComponent(token)}`;
      } catch {
        window.location.href = `${arBaseUrl}/hotel-finance?token=${encodeURIComponent(token)}`;
      }
    };

    void redirectToAr();
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
