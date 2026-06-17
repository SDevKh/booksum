import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/30 bg-card/20 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} BookWise. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">
              Developer: <span className="text-foreground font-semibold">Dev Khandelwal</span>
            </span>
            <a 
              href="mailto:deveshkh141@gmail.com" 
              className="text-primary hover:underline transition-all font-medium"
            >
              deveshkh141@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}