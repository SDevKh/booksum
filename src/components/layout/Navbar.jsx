import { Link, useLocation } from "react-router-dom";
import { BookOpen, Library, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-semibold tracking-tight">BookWise</span>
          </Link>
          
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Summarize</span>
            </Link>
            <Link
              to="/library"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/library")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">My Library</span>
            </Link>

            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              Built for Digital Heroes
            </a>

            {/* User Profile and Logout */}
            {user && (
              <div className="flex items-center gap-2.5 border-l border-border/40 pl-2.5 ml-1">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary/80 border border-border">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                    {user.username.slice(0, 1)}
                  </div>
                  <span className="text-xs font-semibold text-foreground hidden md:inline">
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Log Out"
                  className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}