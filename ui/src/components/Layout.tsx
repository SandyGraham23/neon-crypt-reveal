import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { CountdownFooter } from "./CountdownFooter";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-32">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* Animated gradient orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div
        className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />

      <Header />

      <main className="pt-24 relative z-10">
        <Outlet />
      </main>

      <CountdownFooter />
    </div>
  );
};
