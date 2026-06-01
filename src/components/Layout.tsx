import { Link, useLocation } from "react-router-dom";
import {
  Code2,
  Home,
  FolderOpen,
  Terminal,
  Heart,
  FileCode2,
  Coffee,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

function Breadcrumbs() {
  const location = useLocation();
  const path = location.pathname;

  const segments: { label: string; to?: string; icon?: React.ReactNode }[] = [
    { label: "home", to: "/", icon: <Home className="h-3.5 w-3.5" strokeWidth={3} /> },
  ];

  if (path === "/gists") {
    segments.push({
      label: "gists",
      icon: <FolderOpen className="h-3.5 w-3.5" strokeWidth={3} />,
    });
  } else if (path.startsWith("/route/gist/")) {
    segments.push({
      label: "gists",
      to: "/gists",
      icon: <FolderOpen className="h-3.5 w-3.5" strokeWidth={3} />,
    });
    const filename = decodeURIComponent(path.split("/").pop() || "");
    segments.push({
      label: filename,
      icon: <Code2 className="h-3.5 w-3.5" strokeWidth={3} />,
    });
  } else if (path === "/donate") {
    segments.push({
      label: "donate",
      icon: <Heart className="h-3.5 w-3.5" strokeWidth={3} />,
    });
  }

  return (
    <div className="border-b-3 border-black bg-[#ffd166] px-4 py-2">
      <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm font-bold text-black overflow-x-auto">
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-2 shrink-0">
            {i > 0 && <span className="text-black/40">/</span>}
            {seg.to ? (
              <Link
                to={seg.to}
                className="flex items-center gap-1 hover:underline underline-offset-4 decoration-2"
              >
                {seg.icon}
                {seg.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1">
                {seg.icon}
                {seg.label}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    {
      to: "/",
      label: "Home",
      icon: <Home className="h-4 w-4" strokeWidth={3} />,
      match: location.pathname === "/",
    },
    {
      to: "/gists",
      label: "Gists",
      icon: <FileCode2 className="h-4 w-4" strokeWidth={3} />,
      match:
        location.pathname === "/gists" ||
        location.pathname.startsWith("/route/gist/"),
    },
    {
      to: "/donate",
      label: "Donate",
      icon: <Heart className="h-4 w-4" strokeWidth={3} />,
      match: location.pathname === "/donate",
    },
  ];

  return (
    <div className="min-h-screen bg-[#e8e4df] font-mono flex flex-col">
      {/* Header */}
      <header className="border-b-4 border-black bg-[#ff6b35] px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center border-3 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px]">
              <Terminal className="h-7 w-7" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-black">
                EpanDGist
              </h1>
              <p className="text-xs font-bold text-black/70 uppercase tracking-widest">
                Code Sharing Platform
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 border-3 border-black px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] ${
                  link.match
                    ? "bg-black text-white shadow-none"
                    : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className="sm:hidden flex h-10 w-10 items-center justify-center border-3 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={3} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={3} />
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="sm:hidden mt-4 mx-auto max-w-6xl flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 border-3 border-black px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all ${
                  link.match
                    ? "bg-black text-white shadow-none"
                    : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Breadcrumb bar */}
      <Breadcrumbs />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-black px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Footer grid */}
          <div className="grid gap-8 sm:grid-cols-3 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center border-2 border-white/30 bg-white/10">
                  <Terminal className="h-4 w-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-base font-black text-white uppercase tracking-tight">
                  EpanDGist
                </span>
              </div>
              <p className="text-xs font-bold text-white/40 leading-relaxed">
                Platform code sharing minimalis oleh epandlabs. Share code, keep
                it raw.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-black text-white/60 uppercase tracking-widest mb-3">
                Navigation
              </h4>
              <div className="flex flex-col gap-1.5">
                <Link
                  to="/"
                  className="flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-white transition-colors"
                >
                  <Home className="h-3 w-3" strokeWidth={3} />
                  Home
                </Link>
                <Link
                  to="/gists"
                  className="flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-white transition-colors"
                >
                  <FileCode2 className="h-3 w-3" strokeWidth={3} />
                  Browse Gists
                </Link>
                <Link
                  to="/donate"
                  className="flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-white transition-colors"
                >
                  <Heart className="h-3 w-3" strokeWidth={3} />
                  Donate
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-black text-white/60 uppercase tracking-widest mb-3">
                Support Us
              </h4>
              <div className="flex flex-col gap-1.5">
                <a
                  href="https://trakteer.id/epandlabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-[#ff6b35] transition-colors"
                >
                  <Coffee className="h-3 w-3" strokeWidth={3} />
                  Trakteer
                </a>
                <a
                  href="https://saweria.co/epandlabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-[#ffd166] transition-colors"
                >
                  <Heart className="h-3 w-3" strokeWidth={3} />
                  Saweria
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
              EpanDGist by epandlabs
            </p>
            <p className="text-xs font-bold text-white/20">
              Drop .js .cjs .mjs into /src/gist/ — auto-routed
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
