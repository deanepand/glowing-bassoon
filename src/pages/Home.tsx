import { Link } from "react-router-dom";
import {
  FileCode2,
  ArrowRight,
  Layers,
  GitBranch,
  Braces,
  FileText,
  Box,
  Zap,
  Heart,
} from "lucide-react";
import {
  loadAllGists,
  getExtensionLabel,
  getExtensionColor,
} from "../data/gistLoader";

const iconMap: Record<string, React.ReactNode> = {
  "hello-world.js": <Zap className="h-6 w-6" strokeWidth={3} />,
  "fetch-api.mjs": <GitBranch className="h-6 w-6" strokeWidth={3} />,
  "express-server.cjs": <Box className="h-6 w-6" strokeWidth={3} />,
  "array-utils.js": <Layers className="h-6 w-6" strokeWidth={3} />,
  "promise-handler.mjs": <Braces className="h-6 w-6" strokeWidth={3} />,
  "config-loader.cjs": <FileText className="h-6 w-6" strokeWidth={3} />,
  "event-emitter.js": <Zap className="h-6 w-6" strokeWidth={3} />,
  "state-machine.mjs": <GitBranch className="h-6 w-6" strokeWidth={3} />,
};

const cardColors = [
  "bg-[#ff6b35]",
  "bg-[#ffd166]",
  "bg-[#06d6a0]",
  "bg-[#118ab2]",
  "bg-[#ef476f]",
  "bg-[#8338ec]",
  "bg-[#ff006e]",
  "bg-[#3a86ff]",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function Home() {
  const gists = loadAllGists();

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-10 border-3 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-start gap-6">
          <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center border-3 border-black bg-[#ff6b35] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <FileCode2 className="h-10 w-10 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-black">
              Code Snippets Collection
            </h2>
            <p className="mt-2 text-base font-bold text-black/60 max-w-xl">
              Browse and share JavaScript code snippets. Drop .js, .cjs, or .mjs
              files into the gist folder and they appear here automatically.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black uppercase">
                <FileCode2 className="h-3 w-3" strokeWidth={3} />
                .js
              </span>
              <span className="inline-flex items-center gap-1 border-2 border-black bg-orange-300 px-3 py-1 text-xs font-black uppercase">
                <FileCode2 className="h-3 w-3" strokeWidth={3} />
                .cjs
              </span>
              <span className="inline-flex items-center gap-1 border-2 border-black bg-lime-300 px-3 py-1 text-xs font-black uppercase">
                <FileCode2 className="h-3 w-3" strokeWidth={3} />
                .mjs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border-3 border-black bg-[#ff6b35] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-3xl font-black text-black">{gists.length}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-black/70">
            Total Gists
          </div>
        </div>
        <div className="border-3 border-black bg-[#ffd166] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-3xl font-black text-black">
            {gists.filter((g) => g.extension === "js").length}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-black/70">
            .js Files
          </div>
        </div>
        <div className="border-3 border-black bg-[#06d6a0] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-3xl font-black text-black">
            {gists.filter((g) => g.extension === "mjs").length}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-black/70">
            .mjs Files
          </div>
        </div>
        <div className="border-3 border-black bg-[#118ab2] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-3xl font-black text-black">
            {gists.filter((g) => g.extension === "cjs").length}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-black/70">
            .cjs Files
          </div>
        </div>
      </div>

      {/* Gist Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {gists.map((gist, index) => (
          <Link
            key={gist.filename}
            to={`/route/gist/${gist.filename}`}
            className="group block border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            {/* Card header */}
            <div
              className={`flex items-center justify-between border-b-3 border-black px-5 py-3 ${
                cardColors[index % cardColors.length]
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white">
                  {iconMap[gist.filename] || (
                    <FileCode2 className="h-6 w-6" strokeWidth={3} />
                  )}
                </div>
                <span
                  className={`border-2 border-black px-2 py-0.5 text-xs font-black uppercase ${getExtensionColor(
                    gist.extension
                  )}`}
                >
                  {getExtensionLabel(gist.extension)}
                </span>
              </div>
              <ArrowRight
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                strokeWidth={3}
              />
            </div>

            {/* Card body */}
            <div className="px-5 py-4">
              <h3 className="text-lg font-black uppercase text-black">
                {gist.filename}
              </h3>
              <p className="mt-1 text-sm font-bold text-black/50 line-clamp-2">
                {gist.description}
              </p>

              {/* Meta info */}
              <div className="mt-3 flex items-center gap-4 text-xs font-bold text-black/40 uppercase">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" strokeWidth={3} />
                  {gist.lineCount} lines
                </span>
                <span>{formatBytes(gist.size)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* How to add */}
      <div className="mt-10 border-3 border-black bg-[#8338ec] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white">
        <h3 className="text-xl font-black uppercase flex items-center gap-2">
          <Zap className="h-5 w-5" strokeWidth={3} />
          Auto-Route Magic
        </h3>
        <p className="mt-2 font-bold text-white/80 text-sm">
          Drop any <code className="bg-black/30 px-1.5 py-0.5">.js</code>,{" "}
          <code className="bg-black/30 px-1.5 py-0.5">.cjs</code>, or{" "}
          <code className="bg-black/30 px-1.5 py-0.5">.mjs</code> file into{" "}
          <code className="bg-black/30 px-1.5 py-0.5">src/gist/</code> and it
          automatically gets its own route at{" "}
          <code className="bg-black/30 px-1.5 py-0.5">
            /route/gist/filename.ext
          </code>
        </p>
      </div>

      {/* Support CTA */}
      <div className="mt-6 border-3 border-black bg-[#ef476f] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-white" strokeWidth={3} />
          <p className="font-black text-white uppercase text-sm">
            Suka EpanDGist? Dukung kami lewat Trakteer atau Saweria!
          </p>
        </div>
        <Link
          to="/donate"
          className="inline-flex items-center gap-2 border-3 border-black bg-white px-5 py-2.5 font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] shrink-0"
        >
          <Heart className="h-4 w-4" strokeWidth={3} />
          Donate
        </Link>
      </div>
    </div>
  );
}
