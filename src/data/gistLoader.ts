// Auto-load all gist files using Vite's import.meta.glob
// Adding new .js, .cjs, .mjs files to src/gist/ will auto-route them

const gistModules = import.meta.glob("/src/gist/*.{js,cjs,mjs}", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>;

export interface GistFile {
  filename: string;
  extension: string;
  content: string;
  path: string;
  title: string;
  description: string;
  lineCount: number;
  size: number;
}

function extractMeta(content: string): { title: string; description: string } {
  const lines = content.split("\n");
  let title = "";
  let description = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//")) {
      const comment = trimmed.replace(/^\/\/\s*/, "");
      if (!title) {
        title = comment;
      } else if (!description) {
        description = comment;
        break;
      }
    } else if (trimmed !== "") {
      break;
    }
  }

  return { title, description };
}

function getExtensionLabel(ext: string): string {
  switch (ext) {
    case "js":
      return "JavaScript";
    case "cjs":
      return "CommonJS";
    case "mjs":
      return "ES Module";
    default:
      return ext.toUpperCase();
  }
}

function getExtensionColor(ext: string): string {
  switch (ext) {
    case "js":
      return "bg-yellow-300 border-black";
    case "cjs":
      return "bg-orange-300 border-black";
    case "mjs":
      return "bg-lime-300 border-black";
    default:
      return "bg-gray-300 border-black";
  }
}

export function loadAllGists(): GistFile[] {
  return Object.entries(gistModules).map(([filePath, content]) => {
    const filename = filePath.split("/").pop() || "";
    const extension = filename.split(".").pop() || "";
    const { title, description } = extractMeta(content as string);
    const lineCount = (content as string).split("\n").length;
    const size = new Blob([content as string]).size;

    return {
      filename,
      extension,
      content: content as string,
      path: filePath,
      title: title || filename,
      description: description || "No description provided",
      lineCount,
      size,
    };
  });
}

export function getGistByFilename(filename: string): GistFile | undefined {
  return loadAllGists().find((g) => g.filename === filename);
}

export { getExtensionLabel, getExtensionColor };
