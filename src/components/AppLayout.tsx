import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Users, PlusSquare, Bell, User, Settings, Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import Footer from "@/components/Footer";

const navItems = [
  { path: "/feed", label: "Loyiha Feed", icon: Home },
  { path: "/groups", label: "Guruhlar", icon: Users },
  { path: "/add-post", label: "Post Yaratish", icon: PlusSquare },
  { path: "/notifications", label: "Bildirishnomalar", icon: Bell },
  { path: "/profile", label: "Profil", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = location.pathname === "/auth" || location.pathname === "/";
  const showSidebar = false; // top navbar carries navigation now
  const showMobileNav = isAuthenticated && !isAuthPage;
  const isAdmin = role === "admin" || role === "moderator";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <aside className="hidden md:flex flex-col w-52 border-r border-border bg-sidebar-background shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]">
            <nav className="flex-1 py-4 px-3 space-y-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary border-l-[3px] border-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-sidebar-primary" : ""}`} />
                    {item.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === "/admin"
                      ? "bg-sidebar-accent text-sidebar-primary border-l-[3px] border-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
            <div className="px-3 pb-4">
              <Link
                to="/profile/edit"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
              >
                <Settings className="h-4 w-4" />
                Sozlamalar
              </Link>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {!isAuthPage && <div className="hidden md:block"><Footer /></div>}

      {/* Mobile Bottom Navigation */}
      {showMobileNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex items-center justify-around py-1.5 z-50 safe-area-bottom">
          {navItems.slice(0, 4).map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                <span className="truncate max-w-[56px]">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
          {/* More menu with admin access */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
              mobileMenuOpen ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span>Ko'proq</span>
          </button>
        </nav>
      )}

      {/* Mobile More Menu Overlay */}
      {showMobileNav && mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-16 left-3 right-3 bg-card border border-border rounded-2xl p-3 space-y-1 shadow-xl animate-fade-up"
            onClick={e => e.stopPropagation()}
          >
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === "/profile" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              <User className="h-5 w-5" />
              Profil
            </Link>
            <Link
              to="/profile/edit"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-all"
            >
              <Settings className="h-5 w-5" />
              Sozlamalar
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === "/admin" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                }`}
              >
                <Shield className="h-5 w-5" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
