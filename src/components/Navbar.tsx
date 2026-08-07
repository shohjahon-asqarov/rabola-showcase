import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sun, Moon, Plus, User, Home, LayoutGrid, Trophy, Users, GraduationCap, BarChart3, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import NotificationBell from "@/components/NotificationBell";
import mascotAsset from "@/assets/rabola-mascot.png.asset.json";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { profile, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isAuthPage = location.pathname === "/auth" || location.pathname === "/";

  const navLinks = [
    { path: "/feed", label: "Bosh sahifa", icon: Home },
    { path: "/sites", label: "Saytlar", icon: LayoutGrid },
    { path: "/top", label: "Top reyting", icon: Trophy },
    { path: "/groups", label: "Guruhlar", icon: Users },
    { path: "/teachers", label: "Ustozlar", icon: GraduationCap },
    { path: "/stats", label: "Statistika", icon: BarChart3 },
  ];

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-[0_1px_0_hsl(var(--border)/0.4),0_8px_24px_-16px_hsl(var(--foreground)/0.1)]">
      <div className="container flex h-16 items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-[17px] tracking-tight shrink-0 group">
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden ring-1 ring-primary/15 bg-gradient-to-br from-primary/10 to-[hsl(var(--primary-glow))]/10 transition-transform group-hover:scale-[1.06]">
            <img src={mascotAsset.url} alt="RABOLA" className="h-10 w-10 object-contain drop-shadow-sm" />
          </span>
          <span className="font-extrabold tracking-[-0.02em] text-primary">RABOLA</span>
        </Link>

        {/* Center nav */}
        {isAuthenticated && !isAuthPage && (
          <div className="hidden lg:flex items-center gap-1 mx-auto">
            {navLinks.map(l => {
              const path = l.path;
              const active =
                path === "/feed"
                  ? location.pathname === "/feed"
                  : location.pathname === path ||
                    location.pathname.startsWith(path + "/");
              return (
                <Link
                  key={l.label}
                  to={l.path}
                  className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-[13.5px] font-medium rounded-lg transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                  {active && <span className="absolute left-3 right-3 -bottom-[19px] h-[2px] rounded-full bg-primary" />}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated && (
            <Link
              to="/add-post"
              className="hidden sm:inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" strokeWidth={2.6} /> Sayt joylash
            </Link>
          )}
          <button
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2 transition-colors"
            aria-label="Mavzuni o'zgartirish"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="flex items-center gap-2 rounded-2xl border border-border bg-card pl-1 pr-3 py-1 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2 transition-colors"
                  aria-label="Profil menyusi"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-accent">
                    {profile?.profile_image ? (
                      <img src={profile.profile_image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-[13px] font-semibold">
                      {profile?.firstname || "Profil"} {profile?.lastname?.[0]}.
                    </span>
                    <span className="text-[10px] text-muted-foreground">#{profile?.numeric_id || "----"}</span>
                  </span>
                  <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-popover shadow-xl p-2 animate-fade-in z-50">
                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted">Profil</Link>
                    <Link to="/profile/edit" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted">Sozlamalar</Link>
                    {(role === "admin" || role === "moderator") && (
                      <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted">Admin panel</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10">Chiqish</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/auth"
              className="inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all active:scale-[0.97] shadow-md"
              style={{ background: "var(--gradient-primary)" }}
            >
              Kirish
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
