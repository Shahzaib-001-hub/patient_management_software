"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCog,
  Stethoscope,
  Activity,
  FileText,
  ClipboardList,
  Dumbbell,
  Layers,
  CreditCard,
  BarChart3,
  Settings,
  ShieldCheck,
  Bell,
  LogOut,
  Menu,
  X,
  HeartPulse,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  clinic_admin: "Clinic Admin",
  doctor: "Pain Specialist",
  receptionist: "Receptionist",
  rehab_staff: "Rehab Staff",
  accountant: "Accountant",
  patient: "Patient",
};

function getNavItems(role) {
  if (role === "patient") {
    return [
      { label: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
      { label: "My Appointments", href: "/patient/appointments", icon: Calendar },
      { label: "My Medical Records", href: "/patient/medical-records", icon: FileText },
      { label: "My Treatment Plan", href: "/patient/treatment", icon: ClipboardList },
      { label: "My Exercises", href: "/patient/exercises", icon: Dumbbell },
      { label: "My Progress", href: "/patient/progress", icon: TrendingUp },
      { label: "My Payments", href: "/patient/payments", icon: CreditCard },
      { label: "Wellness Store", href: "/store", icon: ShoppingBag },
      { label: "Profile & Settings", href: "/patient/profile", icon: Settings },
    ];
  }

  if (role === "doctor") {
    return [
      { label: "Doctor Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
      { label: "My Patients", href: "/admin/patients", icon: Users },
      { label: "Appointments", href: "/admin/appointments", icon: Calendar },
      { label: "Pain Assessments", href: "/doctor/assessments", icon: Activity },
      { label: "Treatment Plans", href: "/doctor/treatment-plans", icon: ClipboardList },
      { label: "Rehab Assignments", href: "/doctor/rehabilitation", icon: Dumbbell },
      { label: "Medical Records", href: "/admin/medical-records", icon: FileText },
      { label: "Store & Oils", href: "/admin/store", icon: ShoppingBag },
      { label: "Clinical Reports", href: "/admin/reports", icon: BarChart3 },
    ];
  }

  // Admin / Staff Navigation filtered by role
  const items = [];
  if (["super_admin", "clinic_admin"].includes(role)) {
    items.push({ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard });
  }
  if (["super_admin", "clinic_admin", "receptionist", "rehab_staff", "accountant"].includes(role)) {
    items.push({ label: "Patients", href: "/admin/patients", icon: Users });
  }
  if (["super_admin", "clinic_admin", "receptionist", "rehab_staff"].includes(role)) {
    items.push({ label: "Appointments", href: "/admin/appointments", icon: Calendar });
  }
  if (["super_admin", "clinic_admin"].includes(role)) {
    items.push({ label: "Doctors & Staff", href: "/admin/staff", icon: UserCog });
    items.push({ label: "Pain Assessments", href: "/doctor/assessments", icon: Activity });
    items.push({ label: "Treatment Plans", href: "/doctor/treatment-plans", icon: ClipboardList });
  }
  if (["super_admin", "clinic_admin", "receptionist"].includes(role)) {
    items.push({ label: "Medical Records", href: "/admin/medical-records", icon: FileText });
  }
  if (["super_admin", "clinic_admin", "rehab_staff"].includes(role)) {
    items.push({ label: "Exercise Library", href: "/admin/exercises", icon: Dumbbell });
    items.push({ label: "Exercise Bundles", href: "/admin/bundles", icon: Layers });
    items.push({ label: "Rehab Assignments", href: "/doctor/rehabilitation", icon: Stethoscope });
  }
  if (["super_admin", "clinic_admin", "accountant", "receptionist"].includes(role)) {
    items.push({ label: "Billing & Payments", href: "/admin/billing", icon: CreditCard });
  }
  if (["super_admin", "clinic_admin", "receptionist", "rehab_staff", "accountant"].includes(role)) {
    items.push({ label: "Store & Oils", href: "/admin/store", icon: ShoppingBag });
  }
  if (["super_admin", "clinic_admin", "accountant"].includes(role)) {
    items.push({ label: "Reports", href: "/admin/reports", icon: BarChart3 });
  }
  if (["super_admin", "clinic_admin"].includes(role)) {
    items.push({ label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck });
    items.push({ label: "Clinic Settings", href: "/admin/settings", icon: Settings });
  }
  return items;
}

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const navItems = getNavItems(user?.role || "");

  return (
    <div className="min-h-screen flex bg-[#F5F8FC]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#283983] text-white flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
          <Link
            href="/"
            className="bg-white rounded-lg px-2.5 py-1 flex items-center justify-center shadow-xs"
          >
            <img
              src="/images/brand-logo.png"
              alt="Pain Relief & Wellness Center"
              className="h-8 w-36 object-cover object-center"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-indigo-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-[#283983] shadow-xs"
                    : "text-indigo-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-white/10 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || "Loading..."}
            </p>
            <p className="text-[11px] text-indigo-200 mt-0.5">
              {ROLE_LABELS[user?.role] || "Authenticated User"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-[#BA2820] hover:bg-[#991f18] text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-500 hidden sm:inline">
              Pain Relief &amp; Wellness Center
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#BA2820] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium text-[#283983] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-slate-500 text-center">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n._id}
                        className={`p-3 text-xs ${
                          n.isRead ? "bg-white" : "bg-[#EEF2FF]/50"
                        }`}
                      >
                        <p className="font-semibold text-slate-900">{n.title}</p>
                        <p className="text-slate-600 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="text-xs font-semibold text-slate-700">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
