import { Link } from "react-router-dom";
import {
  Terminal,
  Code2,
  FileCode2,
  Zap,
  Share2,
  Download,
  ArrowRight,
  Layers,
  Braces,
  GitBranch,
  Rocket,
  Heart,
  FolderOpen,
  Copy,
  Coffee,
} from "lucide-react";
import { loadAllGists } from "../data/gistLoader";

const features = [
  {
    icon: <Zap className="h-7 w-7" strokeWidth={2.5} />,
    title: "Auto-Route",
    desc: "Drop file ke /gist/ dan otomatis punya route sendiri. Zero config.",
    color: "bg-[#ff6b35]",
  },
  {
    icon: <FileCode2 className="h-7 w-7" strokeWidth={2.5} />,
    title: "JS / CJS / MJS",
    desc: "Support tiga format JavaScript: vanilla .js, CommonJS .cjs, dan ES Module .mjs.",
    color: "bg-[#ffd166]",
  },
  {
    icon: <Code2 className="h-7 w-7" strokeWidth={2.5} />,
    title: "Syntax Highlight",
    desc: "Code viewer dengan syntax highlighting bawaan. Baca code jadi lebih nyaman.",
    color: "bg-[#06d6a0]",
  },
  {
    icon: <Copy className="h-7 w-7" strokeWidth={2.5} />,
    title: "One-Click Copy",
    desc: "Copy seluruh code snippet cuma satu klik. Langsung paste ke project kamu.",
    color: "bg-[#3a86ff]",
  },
  {
    icon: <Download className="h-7 w-7" strokeWidth={2.5} />,
    title: "Download File",
    desc: "Download langsung file .js original-nya. Siap pakai tanpa edit.",
    color: "bg-[#ef476f]",
  },
  {
    icon: <Share2 className="h-7 w-7" strokeWidth={2.5} />,
    title: "Share Link",
    desc: "Share link langsung ke snippet tertentu. Kolaborasi lebih gampang.",
    color: "bg-[#8338ec]",
  },
];

export default function Landing() {
  const gists = loadAllGists();
  const totalLines = gists.reduce((sum, g) => sum + g.lineCount, 0);

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="relative mb-12">
        {/* Main hero card */}
        <div className="border-3 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Top color strip */}
          <div className="flex h-3">
            <div className="flex-1 bg-[#ff6b35]" />
            <div className="flex-1 bg-[#ffd166]" />
            <div className="flex-1 bg-[#06d6a0]" />
            <div className="flex-1 bg-[#3a86ff]" />
            <div className="flex-1 bg-[#ef476f]" />
            <div className="flex-1 bg-[#8338ec]" />
          </div>

          <div className="px-6 sm:px-10 py-10 sm:py-16">
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              {/* Left side */}
              <div className="flex-1 min-w-0">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 border-3 border-black bg-[#ffd166] px-4 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <Rocket className="h-4 w-4" strokeWidth={3} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Open Source Code Sharing
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-[1.1]">
                  Share Code.
                  <br />
                  <span className="relative inline-block">
                    Keep It
                    <span className="relative z-10"> Raw.</span>
                    <span className="absolute bottom-1 left-0 h-4 w-full bg-[#ff6b35]/40 -z-0" />
                  </span>
                </h1>

                <p className="mt-6 text-lg font-bold text-black/60 max-w-lg leading-relaxed">
                  EpanDGist adalah platform code sharing minimalis dengan
                  desain neo-brutalism. Simpan, bagikan, dan jelajahi snippet
                  JavaScript kamu.
                </p>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/gists"
                    className="inline-flex items-center gap-2 border-3 border-black bg-[#ff6b35] px-6 py-3 text-sm font-black uppercase tracking-wider text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]"
                  >
                    <FolderOpen className="h-5 w-5" strokeWidth={3} />
                    Browse Gists
                    <ArrowRight className="h-4 w-4" strokeWidth={3} />
                  </Link>
                  <Link
                    to="/donate"
                    className="inline-flex items-center gap-2 border-3 border-black bg-[#ef476f] px-6 py-3 text-sm font-black uppercase tracking-wider text-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]"
                  >
                    <Heart className="h-5 w-5" strokeWidth={3} />
                    Support Us
                  </Link>
                </div>

                {/* Extension badges */}
                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black uppercase">
                    <FileCode2 className="h-3 w-3" strokeWidth={3} />.js
                  </span>
                  <span className="inline-flex items-center gap-1 border-2 border-black bg-orange-300 px-3 py-1 text-xs font-black uppercase">
                    <FileCode2 className="h-3 w-3" strokeWidth={3} />.cjs
                  </span>
                  <span className="inline-flex items-center gap-1 border-2 border-black bg-lime-300 px-3 py-1 text-xs font-black uppercase">
                    <FileCode2 className="h-3 w-3" strokeWidth={3} />.mjs
                  </span>
                </div>
              </div>

              {/* Right side — Terminal mockup */}
              <div className="w-full lg:w-[420px] shrink-0">
                <div className="border-3 border-black bg-[#1e1e1e] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 border-b-3 border-black bg-[#2d2d2d] px-4 py-2.5">
                    <div className="h-3 w-3 rounded-full bg-[#ff5f57] border border-black/20" />
                    <div className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-black/20" />
                    <div className="h-3 w-3 rounded-full bg-[#28c840] border border-black/20" />
                    <span className="ml-2 text-xs font-bold text-[#858585] uppercase tracking-wider">
                      epandgist
                    </span>
                  </div>
                  {/* Terminal body */}
                  <div className="p-4 text-sm font-mono leading-7">
                    <div>
                      <span className="text-[#06d6a0]">$</span>{" "}
                      <span className="text-[#d4d4d4]">ls src/gist/</span>
                    </div>
                    {gists.slice(0, 5).map((g) => (
                      <div key={g.filename} className="text-[#569cd6]">
                        {g.filename}
                      </div>
                    ))}
                    {gists.length > 5 && (
                      <div className="text-[#858585]">
                        ...and {gists.length - 5} more
                      </div>
                    )}
                    <div className="mt-2">
                      <span className="text-[#06d6a0]">$</span>{" "}
                      <span className="text-[#d4d4d4]">
                        echo "auto-routed!"
                      </span>
                    </div>
                    <div className="text-[#ce9178]">auto-routed!</div>
                    <div className="mt-2">
                      <span className="text-[#06d6a0]">$</span>{" "}
                      <span className="text-[#858585] animate-pulse">_</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="mb-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border-3 border-black bg-[#ff6b35] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen className="h-5 w-5" strokeWidth={3} />
          </div>
          <div className="text-3xl font-black">{gists.length}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-black/60">
            Total Gists
          </div>
        </div>
        <div className="border-3 border-black bg-[#ffd166] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-5 w-5" strokeWidth={3} />
          </div>
          <div className="text-3xl font-black">{totalLines}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-black/60">
            Total Lines
          </div>
        </div>
        <div className="border-3 border-black bg-[#06d6a0] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-1">
            <Braces className="h-5 w-5" strokeWidth={3} />
          </div>
          <div className="text-3xl font-black">3</div>
          <div className="text-xs font-bold uppercase tracking-widest text-black/60">
            File Types
          </div>
        </div>
        <div className="border-3 border-black bg-[#3a86ff] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="h-5 w-5" strokeWidth={3} />
          </div>
          <div className="text-3xl font-black">Auto</div>
          <div className="text-xs font-bold uppercase tracking-widest text-black/60">
            Routing
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="mb-12">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border-3 border-black bg-[#8338ec] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Zap className="h-5 w-5 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-black">
            Features
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="border-3 border-black bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              <div
                className={`flex items-center gap-3 border-b-3 border-black ${f.color} px-5 py-3`}
              >
                <div className="flex h-11 w-11 items-center justify-center border-2 border-black bg-white">
                  {f.icon}
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">
                  {f.title}
                </h3>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm font-bold text-black/55 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== RECENT GISTS PREVIEW ===== */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-3 border-black bg-[#06d6a0] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <FileCode2 className="h-5 w-5" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">
              Gists Terbaru
            </h2>
          </div>
          <Link
            to="/gists"
            className="inline-flex items-center gap-1 border-3 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Lihat Semua
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gists.slice(0, 3).map((gist, i) => {
            const colors = ["bg-[#ff6b35]", "bg-[#3a86ff]", "bg-[#06d6a0]"];
            return (
              <Link
                to={`/route/gist/${gist.filename}`}
                key={gist.filename}
                className="group border-3 border-black bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]"
              >
                <div
                  className={`flex items-center justify-between border-b-3 border-black ${colors[i]} px-4 py-2.5`}
                >
                  <span className="text-xs font-black uppercase tracking-wider">
                    {gist.filename}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={3}
                  />
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-bold text-black/50 line-clamp-2 leading-relaxed">
                    {gist.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs font-bold text-black/35 uppercase">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" strokeWidth={3} />
                      {gist.lineCount} lines
                    </span>
                    <span>.{gist.extension}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== SUPPORT CTA ===== */}
      <section>
        <div className="border-3 border-black bg-[#ef476f] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="px-6 sm:px-10 py-8 sm:py-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center border-3 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Coffee className="h-8 w-8" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              Suka EpanDGist?
            </h2>
            <p className="mt-3 text-base font-bold text-white/80 max-w-lg mx-auto">
              Dukung pengembangan EpanDGist dengan mentraktir atau donasi.
              Setiap dukungan sangat berarti!
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 border-3 border-black bg-white px-6 py-3 text-sm font-black uppercase tracking-wider text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]"
              >
                <Heart className="h-5 w-5" strokeWidth={3} />
                Donate Sekarang
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
