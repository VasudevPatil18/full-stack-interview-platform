import { Link, useLocation } from "react-router";
import { BookOpenIcon, CalendarIcon, LayoutDashboardIcon, LogOutIcon, ShieldIcon, SparklesIcon, UserIcon, MenuIcon, SunIcon, MoonIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { useIsMobile } from "../hooks/useIsMobile";
import { useState, useEffect } from "react";

function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    return localStorage.getItem("theme") || "dark";
  });

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === "admin";

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* LOGO */}
        <Link
          to="/"
          className="group flex items-center gap-3 hover:scale-105 transition-transform duration-200"
        >
          <div className="size-10 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg ">
            <SparklesIcon className="size-6 text-white" />
          </div>

          <div className="flex flex-col">
            <span className="font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
              Talent IQ
            </span>
            <span className="text-xs text-base-content/60 font-medium -mt-1 hidden sm:block">Code Together</span>
          </div>
        </Link>

        {isMobile ? (
          // MOBILE MENU
          <div className="flex items-center gap-2">
            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <SunIcon className="size-5" />
              ) : (
                <MoonIcon className="size-5" />
              )}
            </button>

            <NotificationBell />
            
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <MenuIcon className="size-5" />
              </label>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <Link to="/problems" className={isActive("/problems") ? "active" : ""}>
                    <BookOpenIcon className="size-4" />
                    Problems
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
                    <LayoutDashboardIcon className="size-4" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/schedule" className={isActive("/schedule") ? "active" : ""}>
                    <CalendarIcon className="size-4" />
                    Schedule
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link to="/admin" className={location.pathname.startsWith("/admin") ? "active" : ""}>
                      <ShieldIcon className="size-4" />
                      Admin
                    </Link>
                  </li>
                )}
                <li className="menu-title">
                  <span>{user?.name}</span>
                  <span className="text-xs">{user?.email}</span>
                </li>
                {isAdmin && (
                  <li className="menu-title">
                    <span className="badge badge-accent badge-sm">Admin</span>
                  </li>
                )}
                <li>
                  <button onClick={logout} className="text-error">
                    <LogOutIcon className="size-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          // DESKTOP MENU
          <div className="flex items-center gap-1">
            {/* PROBLEMS PAGE LINK */}
            <Link
              to={"/problems"}
              className={`px-4 py-2.5 rounded-lg transition-all duration-200 
                ${
                  isActive("/problems")
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                }
                
                `}
            >
              <div className="flex items-center gap-x-2.5">
                <BookOpenIcon className="size-4" />
                <span className="font-medium hidden sm:inline">Problems</span>
              </div>
            </Link>

            {/* DASHBORD PAGE LINK */}
            <Link
              to={"/dashboard"}
              className={`px-4 py-2.5 rounded-lg transition-all duration-200 
                ${
                  isActive("/dashboard")
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                }
                
                `}
            >
              <div className="flex items-center gap-x-2.5">
                <LayoutDashboardIcon className="size-4" />
                <span className="font-medium hidden sm:inline">Dashboard</span>
              </div>
            </Link>

            {/* SCHEDULE PAGE LINK */}
            <Link
              to={"/schedule"}
              className={`px-4 py-2.5 rounded-lg transition-all duration-200 
                ${
                  isActive("/schedule")
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                }
                
                `}
            >
              <div className="flex items-center gap-x-2.5">
                <CalendarIcon className="size-4" />
                <span className="font-medium hidden sm:inline">Schedule</span>
              </div>
            </Link>

            {/* ADMIN LINK - Only for admins */}
            {isAdmin && (
              <Link
                to={"/admin"}
                className={`px-4 py-2.5 rounded-lg transition-all duration-200 
                  ${
                    location.pathname.startsWith("/admin")
                      ? "bg-accent text-accent-content"
                      : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                  }
                  
                  `}
              >
                <div className="flex items-center gap-x-2.5">
                  <ShieldIcon className="size-4" />
                  <span className="font-medium hidden sm:inline">Admin</span>
                </div>
              </Link>
            )}

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <SunIcon className="size-5" />
              ) : (
                <MoonIcon className="size-5" />
              )}
            </button>

            {/* NOTIFICATION BELL */}
            <NotificationBell />

            {/* USER DROPDOWN */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} />
                  ) : (
                    <UserIcon className="size-5 text-primary" />
                  )}
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li className="menu-title">
                  <span>{user?.name}</span>
                  <span className="text-xs">{user?.email}</span>
                </li>
                {isAdmin && (
                  <li className="menu-title">
                    <span className="badge badge-accent badge-sm">Admin</span>
                  </li>
                )}
                <li>
                  <button onClick={logout} className="text-error">
                    <LogOutIcon className="size-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
export default Navbar;
