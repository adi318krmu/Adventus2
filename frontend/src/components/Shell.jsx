import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, BookOpen, KeyRound, CreditCard, User } from "lucide-react";
import Brand from "./Brand";
import UserAvatar from "./UserAvatar";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const getNavLinkIcon = (label) => {
  switch (label) {
    case "Dashboard":
      return <LayoutDashboard size={16} />;
    case "Study Materials":
      return <BookOpen size={16} />;
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
    <div className="min-h-screen bg-ink text-white">
      <header className="border-b border-line bg-ink/95 px-5 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Link to={type === "admin" ? "/admin/dashboard" : "/student/dashboard"}><Brand size="small" /></Link>
          <div className="flex flex-wrap items-center gap-3">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${isActive ? "bg-mint text-ink" : "border border-line text-slate-300 hover:text-mint hover:bg-mint/10"}`}>
                {getNavLinkIcon(label)}
                {label}
              </NavLink>
            ))}
            <ThemeToggle />
            {user && (
              <Link to={type === "admin" ? "/admin/dashboard" : "/profile"} title={user?.name || user?.username || "Profile"} className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-mint/50 transition">
                <UserAvatar user={user} className="h-9 w-9 text-xs" />
              </Link>
            )}
            <button className="btn-outline flex items-center gap-2 !px-3" onClick={() => { logout(); navigate("/"); }}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>
      <main className="brand-scroll mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
};

export default Shell;
