// Serveur dev-only pour l'éditeur d'arborescence. Aucune dépendance : http + fs natifs.
// Lance-le avec `npm run fs:editor`, puis ouvre http://localhost:5177.
//
//   GET  /              -> l'éditeur (index.html)
//   GET  /fs-sync.js    -> le module de diff (réutilisé côté navigateur pour le contrôle live)
//   GET  /api/state     -> { tree, files }  (JSON logique + fichiers réellement présents)
//   POST /api/save      -> réécrit public/file-system.json, renvoie { ok, files, diff }

import { createServer } from "node:http"
import { readFile, writeFile, readdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { diffFileSystem } from "./fs-sync.js"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, "..", "..")
const JSON_PATH = join(ROOT, "public", "file-system.json")
const FICHIERS_DIR = join(ROOT, "public", "fichiers")
const PORT = 5177

async function listFiles() {
  const entries = await readdir(FICHIERS_DIR, { withFileTypes: true })
  // On ignore les dotfiles d'infra (.gitkeep…) : ce ne sont pas des fichiers de contenu.
  return entries.filter((e) => e.isFile() && !e.name.startsWith(".")).map((e) => e.name).sort()
}

async function readTree() {
  return JSON.parse(await readFile(JSON_PATH, "utf8"))
}

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" })
  res.end(body)
}

async function serveFile(res, path, type) {
  try {
    send(res, 200, await readFile(path), type)
  } catch {
    send(res, 404, "not found", "text/plain")
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ""
    req.on("data", (chunk) => (data += chunk))
    req.on("end", () => resolve(data))
    req.on("error", reject)
  })
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      return serveFile(res, join(HERE, "index.html"), "text/html; charset=utf-8")
    }
    if (req.method === "GET" && req.url === "/fs-sync.js") {
      return serveFile(res, join(HERE, "fs-sync.js"), "text/javascript; charset=utf-8")
    }
    if (req.method === "GET" && req.url === "/api/state") {
      const [tree, files] = await Promise.all([readTree(), listFiles()])
      return send(res, 200, JSON.stringify({ tree, files }))
    }
    if (req.method === "POST" && req.url === "/api/save") {
      const tree = JSON.parse(await readBody(req))
      await writeFile(JSON_PATH, JSON.stringify(tree, null, 2) + "\n", "utf8")
      const files = await listFiles()
      return send(res, 200, JSON.stringify({ ok: true, files, diff: diffFileSystem(tree, files) }))
    }
    send(res, 404, "not found", "text/plain")
  } catch (err) {
    send(res, 500, JSON.stringify({ error: String(err && err.message || err) }))
  }
})

server.listen(PORT, () => {
  console.log(`\n  Éditeur d'arborescence  ->  http://localhost:${PORT}\n  (Ctrl+C pour arrêter)\n`)
})
