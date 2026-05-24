import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import Brand from "./Brand";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Shell = ({ children, type = "student" }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = type === "admin"
    ? [["/admin/dashboard", "Dashboard"], ["/admin/fees", "Fee Records"]]
    : [["/student/dashboard", "Dashboard"], ["/payment", "Payment"], ["/profile", "Profile"]];

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="border-b border-line bg-ink/95 px-5 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Link to={type === "admin" ? "/admin/dashboard" : "/student/dashboard"}><Brand /></Link>
          <div className="flex flex-wrap items-center gap-3">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `rounded-xl px-4 py-2 text-sm font-semibold ${isActive ? "bg-mint text-ink" : "border border-line text-slate-300 hover:text-mint"}`}>
                {label}
              </NavLink>
            ))}
            <ThemeToggle />
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
