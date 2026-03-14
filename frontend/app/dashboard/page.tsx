"use client";

import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  BarChart3,
  FileText,
  Database,
  ArrowRight,
  BadgeDollarSign,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

interface ModuleCard {
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  url: string;
}

const MODULE_CONFIG: Record<string, ModuleCard> = {
  ar: {
    name: "Accounts Receivable",
    description:
      "Hotel finance management — bookings, invoices, organizations, and corporate billing",
    icon: <BarChart3 className="w-7 h-7" />,
    gradient: "from-blue-500 to-cyan-400",
    iconBg: "bg-blue-500",
    url: "/dashboard/ar",
  },
  reconcile: {
    name: "Reconciliation",
    description:
      "Payment reconciliation, matching, and exception management",
    icon: <FileText className="w-7 h-7" />,
    gradient: "from-emerald-500 to-teal-400",
    iconBg: "bg-emerald-500",
    url: "/dashboard/reconcile",
  },
  edsp: {
    name: "Enterprise Data Sharing",
    description:
      "Secure data sharing, downloads, and enterprise data services",
    icon: <Database className="w-7 h-7" />,
    gradient: "from-violet-500 to-purple-400",
    iconBg: "bg-violet-500",
    url: "/dashboard/edsp",
  },
};

/* ── Mock card for Financial Reconciliation (always shown) ── */
const MOCK_FINRECON: ModuleCard & { id: string; comingSoon: true } = {
  id: "finrecon",
  comingSoon: true,
  name: "Financial Reconciliation",
  description:
    "Automated bank-statement matching, ledger reconciliation, and variance analysis across all entities",
  icon: <BadgeDollarSign className="w-7 h-7" />,
  gradient: "from-amber-500 to-orange-400",
  iconBg: "bg-amber-500",
  url: "#",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const userModules = user.modules || [];
  const availableModules = userModules
    .map((id) => ({ id, comingSoon: false as const, ...MODULE_CONFIG[id] }))
    .filter((m) => m.name);

  /* Combine real + mock cards */
  const allCards = [...availableModules, MOCK_FINRECON];

  return (
    <>
      <Navbar />

      {/* ── Full-width bright gradient background ── */}
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
        <main className="max-w-[1200px] mx-auto px-6 pt-10 pb-16">
          {/* ── Welcome banner ── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 md:p-10 mb-10 shadow-lg">
            {/* decorative shapes */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <p className="text-blue-100 text-sm font-medium flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4" /> Good to see you!
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                Welcome back, {user.fullName?.split(" ")[0] || user.email.split("@")[0]}
              </h1>
              <p className="text-blue-200 mt-2 text-base">
                {user.platformRole === "superadmin"
                  ? "Platform Administrator"
                  : user.platformRole === "org_admin"
                  ? "Organization Administrator"
                  : "Team Member"}{" "}
                &middot; {user.email}
              </p>
            </div>
          </div>

          {/* ── Section heading ── */}
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" /> Your Modules
          </h2>

          {/* ── Module cards grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {allCards.map((mod) => {
              const isComingSoon = mod.comingSoon;

              return (
                <div
                  key={mod.id}
                  role={isComingSoon ? undefined : "button"}
                  tabIndex={isComingSoon ? -1 : 0}
                  onClick={
                    isComingSoon
                      ? undefined
                      : () => {
                          router.push(mod.url)
                        }
                  }
                  onKeyDown={
                    isComingSoon
                      ? undefined
                      : (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            router.push(mod.url)
                          }
                        }
                  }
                  className={`group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm p-6 transition-all duration-200
                    ${isComingSoon ? "cursor-default opacity-90" : "cursor-pointer hover:shadow-xl hover:-translate-y-1"}`}
                >
                  {/* Colour accent stripe at top */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${mod.gradient}`}
                  />

                  {/* Coming-soon badge */}
                  {isComingSoon && (
                    <span className="absolute top-4 right-4 text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon circle */}
                    <div
                      className={`shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${mod.gradient} text-white flex items-center justify-center shadow-md`}
                    >
                      {mod.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {mod.name}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer action */}
                  {!isComingSoon ? (
                    <div className="mt-5 flex items-center text-blue-600 text-sm font-semibold">
                      Open module
                      <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ) : (
                    <div className="mt-5 flex items-center text-amber-600/70 text-sm font-medium">
                      <Shield className="w-4 h-4 mr-1.5" />
                      Under development
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Quick Stats ── */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6">
              <p className="text-sm text-blue-600 font-semibold">Active Modules</p>
              <p className="text-4xl font-extrabold text-blue-700 mt-1">
                {availableModules.length}
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 p-6">
              <p className="text-sm text-violet-600 font-semibold">Organization</p>
              <p className="text-lg font-bold text-violet-800 mt-1">
                {user.organizationId ? "Connected" : "Personal Account"}
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6">
              <p className="text-sm text-emerald-600 font-semibold">Account Status</p>
              <p className="text-lg font-bold text-emerald-700 mt-1">Active</p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
