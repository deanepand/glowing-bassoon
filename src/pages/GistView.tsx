import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileCode2,
  Layers,
  Clock,
  Download,
  Copy,
  Check,
  ChevronRight,
  Hash,
  AlertTriangle,
} from "lucide-react";
import { useState, useCallback } from "react";
import {
  getGistByFilename,
  getExtensionLabel,
  getExtensionColor,
  loadAllGists,
} from "../data/gistLoader";
import CodeBlock from "../components/CodeBlock";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function GistView() {
  const { filename } = useParams<{ filename: string }>();
  const [copiedUrl, setCopiedUrl] = useState(false);

  const gist = filename ? getGistByFilename(filename) : undefined;
  const allGists = loadAllGists();

  const handleCopyUrl = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  }, []);

  const handleDownload = useCallback(() => {
    if (!gist) return;
    const blob = new Blob([gist.content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = gist.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [gist]);

  if (!gist) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="border-3 border-black bg-[#ef476f] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center border-3 border-black bg-white">
              <AlertTriangle className="h-8 w-8 text-black" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-2xl font-black uppercase text-black">
            Gist Not Found
          </h2>
          <p className="mt-2 font-bold text-black/70">
            The file <code className="bg-black/20 px-2 py-0.5">{filename}</code>{" "}
            does not exist in the gist collection.
          </p>
          <Link
            to="/gists"
            className="mt-6 inline-flex items-center gap-2 border-3 border-black bg-white px-6 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={3} />
            Back to Gists
          </Link>
        </div>
      </div>
    );
  }

  // Get adjacent gists for navigation
  const currentIndex = allGists.findIndex((g) => g.filename === gist.filename);
  const prevGist = currentIndex > 0 ? allGists[currentIndex - 1] : null;
  const nextGist =
    currentIndex < allGists.length - 1 ? allGists[currentIndex + 1] : null;

  return (
    <div>
      {/* Top navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/gists"
          className="inline-flex items-center gap-2 border-3 border-black bg-white px-4 py-2 font-bold uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={3} />
          All Gists
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleCopyUrl}
            className={`inline-flex items-center gap-2 border-3 border-black px-4 py-2 font-bold uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] ${
              copiedUrl ? "bg-[#06d6a0]" : "bg-[#ffd166]"
            }`}
          >
            {copiedUrl ? (
              <>
                <Check className="h-4 w-4" strokeWidth={3} />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" strokeWidth={3} />
                Share
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 border-3 border-black bg-[#3a86ff] px-4 py-2 font-bold uppercase text-sm text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <Download className="h-4 w-4" strokeWidth={3} />
            Download
          </button>
        </div>
      </div>

      {/* File info card */}
      <div className="mb-6 border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-3 border-black bg-[#ff6b35] px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center border-3 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <FileCode2 className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                {gist.filename}
              </h2>
              <p className="text-sm font-bold text-black/70">{gist.title}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 px-6 py-3">
          <span
            className={`inline-flex items-center gap-1 border-2 border-black px-3 py-1 text-xs font-black uppercase ${getExtensionColor(
              gist.extension
            )}`}
          >
            <FileCode2 className="h-3 w-3" strokeWidth={3} />
            {getExtensionLabel(gist.extension)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-black/50 uppercase">
            <Layers className="h-3.5 w-3.5" strokeWidth={3} />
            {gist.lineCount} lines
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-black/50 uppercase">
            <Hash className="h-3.5 w-3.5" strokeWidth={3} />
            {formatBytes(gist.size)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-black/50 uppercase">
            <Clock className="h-3.5 w-3.5" strokeWidth={3} />
            .{gist.extension} module
          </span>
        </div>
      </div>

      {/* Description */}
      {gist.description && (
        <div className="mb-6 border-3 border-black bg-[#ffd166] px-6 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold text-black text-sm">{gist.description}</p>
        </div>
      )}

      {/* Code Block */}
      <CodeBlock code={gist.content} filename={gist.filename} />

      {/* Navigation between gists */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevGist ? (
          <Link
            to={`/route/gist/${prevGist.filename}`}
            className="flex items-center gap-3 border-3 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" strokeWidth={3} />
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase text-black/40">
                Previous
              </div>
              <div className="font-black text-black truncate">
                {prevGist.filename}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextGist && (
          <Link
            to={`/route/gist/${nextGist.filename}`}
            className="flex items-center justify-end gap-3 border-3 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] text-right"
          >
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase text-black/40">
                Next
              </div>
              <div className="font-black text-black truncate">
                {nextGist.filename}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={3} />
          </Link>
        )}
      </div>
    </div>
  );
}
