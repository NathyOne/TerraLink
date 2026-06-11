import {
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  Hammer,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  Send,
  Truck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

import { roleLabel } from "../utils/format";
import { useAuthStore } from "../store/authStore";
import { useI18n } from "../i18n/I18nContext";
import LanguageSwitch from "./LanguageSwitch";

const nav = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/requests", label: "Requests", icon: ClipboardList },
    { to: "/admin/matching", label: "Matching", icon: Hammer },
    { to: "/admin/users", label: "Users", icon: UsersRound },
    { to: "/admin/machines", label: "Machines", icon: Truck },
    { to: "/admin/assignments", label: "Assignments", icon: Boxes },
    { to: "/admin/materials", label: "Materials", icon: Package },
    { to: "/admin/send-message", label: "Send Message", icon: Send },
  ],
  construction_owner: [
    { to: "/construction", label: "Dashboard", icon: LayoutDashboard },
    { to: "/construction/requests/new", label: "New Request", icon: Building2 },
    { to: "/construction/requests", label: "My Requests", icon: ClipboardList },
  ],
  machine_owner: [
    { to: "/machine", label: "Dashboard", icon: LayoutDashboard },
    { to: "/machine/machines", label: "My Machines", icon: Truck },
    { to: "/machine/machines/new", label: "Add Machine", icon: Hammer },
    { to: "/machine/messages", label: "Messages", icon: MessageSquareText },
    { to: "/machine/profile", label: "Profile", icon: UserRound },
  ],
};

function Sidebar({ open, onClose }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { t } = useI18n();
  const navigate = useNavigate();
  const items = nav[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-slate-950/40 lg:hidden ${open ? "block" : "hidden"}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-stone-200 bg-white transition lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-stone-200 px-5">
          <NavLink to="/" className="flex items-center gap-3" onClick={onClose}>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
              <Hammer size={21} />
            </span>
            <span>
              <span className="block text-lg font-bold text-slate-950">TerraLink</span>
              <span className="block text-xs font-semibold text-stone-500">{t(roleLabel[user?.role])}</span>
            </span>
          </NavLink>
          <button className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 lg:hidden" onClick={onClose} aria-label={t("Close menu")}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin" || item.to === "/construction" || item.to === "/machine"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                    isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-stone-100"
                  }`
                }
              >
                <Icon size={18} />
                {t(item.label)}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-stone-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-stone-50 p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <UserRound size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{user?.username}</p>
              <p className="truncate text-xs font-medium text-stone-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white text-sm font-semibold text-slate-800 hover:bg-stone-50">
            <LogOut size={17} />
            {t("Sign out")}
          </button>
        </div>
      </aside>
    </>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#f6f7f4] lg:flex">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <button className="rounded-lg p-2 text-slate-700 hover:bg-stone-100 lg:hidden" onClick={() => setOpen(true)} aria-label={t("Open menu")}>
            <Menu size={22} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-stone-500">{t(roleLabel[user?.role])}</p>
            <h1 className="text-lg font-bold text-slate-950">{t("Operations Workspace")}</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">{user?.username}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-slate-700">
              <Bell size={18} />
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
