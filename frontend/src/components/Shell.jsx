import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, BookOpen, KeyRound, CreditCard, User, Scroll } from "lucide-react";
import Brand from "./Brand";
import UserAvatar from "./UserAvatar";
import CompanionAvatar from "./CompanionAvatar";
import SakuraPetals from "./SakuraPetals";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const getNavLinkIcon = (label) => {
  switch (label) {
    case "Dashboard":
      return <LayoutDashboard size={16} />;
    case "Study Materials":
      return <Scroll size={16} />;
    case "Password Requests":
    case "Change Password":
      return <KeyRound size={16} />;
    case "Fee Records":
    case "Payment":
      return <CreditCard size={16} />;
    case "Accounts":
    case "Profile":
      return <User size={16} />;
    default:
      return null;
  }
};

const Shell = ({ children, type = "student" }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const links = type === "admin"
    ? [
        ["/admin/dashboard", "Dashboard"],
        ["/admin/materials", "Study Materials"],
        ["/admin/password-requests", "Password Requests"],
        ["/admin/fees", "Fee Records"],
        ["/admin/accounts", "Accounts"]
      ]
    : user?.isTempPassword
      ? [["/student/change-password", "Change Password"]]
      : [
          ["/student/dashboard", "Dashboard"],
          ["/student/materials", "Study Materials"],
          ["/payment", "Payment"],
          ["/profile", "Profile"]
        ];

  return (
    <div className="relative min-h-screen bg-ink text-white shoji-pattern transition-colors duration-300">
      <SakuraPetals />
      
      {/* Top Header / Dojo Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-amber-500/30 bg-ink/90 px-5 py-4 backdrop-blur-md transition-colors duration-300 shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link to={type === "admin" ? "/admin/dashboard" : "/student/dashboard"}>
            <Brand size="small" />
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-200 border ${
                    isActive
                      ? "bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 border-amber-400 shadow-samuraiGold"
                      : "border-amber-500/30 text-amber-100/80 hover:text-amber-300 hover:border-amber-500/60 hover:bg-amber-500/10"
                  }`
                }
              >
                {getNavLinkIcon(label)}
                <span>{label}</span>
              </NavLink>
            ))}

            <ThemeToggle />

            {user && (
              <Link
                to={type === "admin" ? "/admin/dashboard" : "/profile"}
                title={user?.name || user?.username || "Profile"}
                className="flex items-center gap-2 rounded-full p-0.5 border border-amber-500/40 hover:border-amber-400 hover:scale-105 transition"
              >
                <UserAvatar user={user} className="h-8 w-8 text-xs" />
              </Link>
            )}

            <button
              className="rounded-xl border border-red-700/60 bg-red-950/40 px-3 py-2 text-xs font-bold text-red-300 transition-all hover:bg-red-900/60 hover:text-white flex items-center gap-1.5"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 brand-scroll mx-auto max-w-7xl px-4 sm:px-6 py-8">{children}</main>

      {/* Avatar Companion */}
      {type === "student" && user && <CompanionAvatar />}
    </div>
  );
};

export default Shell;
