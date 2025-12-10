import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(process.cwd(), 'server', 'storage');
const DOCS = path.join(ROOT, 'documents');
function ensureDirs() {
    if (!fs.existsSync(ROOT))
        fs.mkdirSync(ROOT, { recursive: true });
    if (!fs.existsSync(DOCS))
        fs.mkdirSync(DOCS, { recursive: true });
}
export function listDocuments() {
    ensureDirs();
    const files = fs.readdirSync(DOCS);
    return files.map(f => getMetaByFilename(f)).filter(Boolean);
}
function getMetaByFilename(filename) {
    const filePath = path.join(DOCS, filename);
    if (!fs.existsSync(filePath))
        return null;
    const stat = fs.statSync(filePath);
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    const id = filename;
    return {
        id,
        name,
        ext,
        size: stat.size,
        createdAt: stat.birthtimeMs,
        updatedAt: stat.mtimeMs
    };
}
export function getDocument(id) {
    ensureDirs();
    const filePath = path.join(DOCS, id);
    if (!fs.existsSync(filePath))
        return null;
    const meta = getMetaByFilename(id);
    const buffer = fs.readFileSync(filePath);
    return { meta, buffer };
}
export function saveDocument(name, ext, buffer) {
    ensureDirs();
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName}${ext.startsWith('.') ? ext : `.${ext}`}`;
    const filePath = path.join(DOCS, filename);
    fs.writeFileSync(filePath, new Uint8Array(buffer));
    return getMetaByFilename(filename);
}
export function updateDocument(id, buffer) {
    ensureDirs();
    const filePath = path.join(DOCS, id);
    if (!fs.existsSync(filePath))
        return null;
    fs.writeFileSync(filePath, new Uint8Array(buffer));
    return getMetaByFilename(id);
}
export function deleteDocument(id) {
    ensureDirs();
    const filePath = path.join(DOCS, id);
    if (!fs.existsSync(filePath))
        return false;
    fs.unlinkSync(filePath);
    return true;
}
