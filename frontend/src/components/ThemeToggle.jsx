import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="btn-outline flex items-center gap-2 !px-3" onClick={toggleTheme} type="button">
      {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
      <span>{theme === "dark" ? "Night" : "Day"}</span>
    </button>
  );
};

export default ThemeToggle;
