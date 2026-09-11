const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const skillName = 'gd-agentic-skills-use';
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0).flatMap(e => {
    if (['.git', '.DS_Store', '__pycache__', 'agents'].includes(e.name)) return [];
    const p = path.join(dir, e.name);
    if (e.isSymbolicLink()) throw new Error(`Unsupported upstream symlink: ${p}`);
    return e.isDirectory() ? walk(p) : [p];
  });
}
function stripFrontmatter(text) { return text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, ''); }
function relative(from, to) { return path.relative(path.dirname(from), to).split(path.sep).join('/'); }
function links(text) { return [...text.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)].map(m => m[1]); }
function localTarget(file, target) {
  if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(target)) return null;
  return path.resolve(path.dirname(file), decodeURIComponent(target.split(/[?#]/)[0]));
}
module.exports = {fs, path, root, skillName, walk, stripFrontmatter, relative, links, localTarget};
