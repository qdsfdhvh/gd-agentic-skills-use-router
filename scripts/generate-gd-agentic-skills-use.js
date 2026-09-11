#!/usr/bin/env node
const { execFileSync } = require('node:child_process');
const {fs, path, root, skillName, walk, stripFrontmatter, relative, links, localTarget} = require('./lib');

function generate(source, output, template) {
  source = fs.realpathSync(source);
  output = path.resolve(output);
  // A custom output is allowed only when it cannot erase an existing project or source.
  const protectedPaths = [source, root];
  if (protectedPaths.some(p => p === output || p.startsWith(output + path.sep)) || output.startsWith(source + path.sep)) {
    throw new Error('Output overlaps the repository or upstream source');
  }
  if (fs.existsSync(output)) {
    const marker = path.join(output, 'SKILL.md');
    if (fs.lstatSync(output).isSymbolicLink() || !fs.existsSync(marker) || !fs.readFileSync(marker, 'utf8').includes(`name: ${skillName}\n`)) {
      throw new Error('Existing output is not this generated skill');
    }
  }
  const sourceRoot = path.dirname(source);
  const git = (...args) => execFileSync('git', ['-C', sourceRoot, ...args], {encoding:'utf8', stdio:['ignore','pipe','pipe']}).trim();
  const commit = git('rev-parse', 'HEAD');
  if (git('status', '--porcelain', '--', 'skills', 'LICENSE')) throw new Error('Upstream skills/LICENSE have uncommitted changes');
  let version;
  try { version = git('describe', '--tags', '--long', '--always'); } catch { version = commit.slice(0,12); }
  const routerVersion = require('../package.json').version;
  version = `${routerVersion}+upstream.${version}`;
  const names = fs.readdirSync(source).filter(n => fs.existsSync(path.join(source,n,'SKILL.md'))).sort();
  for (const required of ['godot-master','godot-version-migration']) if (!names.includes(required)) throw new Error(`Missing ${required}`);
  const license = fs.readFileSync(path.join(sourceRoot,'LICENSE'));
  const templateText = fs.readFileSync(template,'utf8');
  const files = walk(source);
  const mapped = new Map(files.map(f => [f, path.join(output,'references',path.relative(source,f)).replace(/(^|\/)SKILL\.md$/, '$1DOC.md')]));
  const destinations = new Set(mapped.values());
  const repairs = [];
  function transform(file) {
    const dest = mapped.get(file);
    let text = stripFrontmatter(fs.readFileSync(file,'utf8'));
    // Convert upstream web pointers only when their target is in this pinned package.
    text = text.replace(/https:\/\/github\.com\/thedivergentai\/gd-agentic-skills\/(?:blob|tree)\/(?:main|master)\/skills\/[^\s)\]"<>`#]+/gi, url => {
      const suffix = url.match(/\/skills\/(.*)$/i)[1];
      const target = mapped.get(path.join(source, suffix));
      return target ? relative(dest,target) : url;
    });
    text = text.replaceAll('SKILL.md', 'DOC.md');
    for (const link of new Set(links(text))) {
      const target = localTarget(dest,link);
      if (!target || destinations.has(target)) continue;
      let fixed;
      const sibling = link.match(/(?:^|\/)(godot-[\w-]+)\/DOC\.md(?:#.*)?$/);
      if (sibling && names.includes(sibling[1])) fixed = path.join(output,'references',sibling[1],'DOC.md');
      // Master mirrors occasionally omit their script's topic prefix.
      if (!fixed && file.includes('/godot-master/')) {
        const basename = path.basename(target);
        const candidates = [...mapped.values()].filter(p => p.startsWith(path.join(output,'references/godot-master/scripts') + path.sep) && path.basename(p).endsWith('_'+basename));
        if (candidates.length === 1) fixed = candidates[0];
      }
      if (!fixed && link.includes('scripts/')) {
        const owner = path.relative(source, file).split(path.sep)[0];
        const topic = owner === 'godot-version-migration' ? 'godot-' + path.basename(file, '.md') : owner;
        const candidate = path.join(output, 'references', topic, 'scripts', path.basename(target));
        if (destinations.has(candidate)) fixed = candidate;
      }
      if (fixed) {
        const replacement = relative(dest,fixed) + (link.includes('#') ? '#'+link.split('#')[1] : '');
        text = text.replaceAll(`](${link})`, `](${replacement})`);
        repairs.push({file:path.relative(output,dest), from:link, to:replacement});
      }
    }
    return text;
  }
  // Prepare all transformations before replacing existing output.
  const rendered = new Map(files.filter(f=>f.endsWith('.md')).map(f=>[f,transform(f)]));
  const stage = fs.mkdtempSync(path.join(path.dirname(output),'.gd-router-'));
  try {
    for (const file of files) {
      const dest = path.join(stage,path.relative(output,mapped.get(file)));
      fs.mkdirSync(path.dirname(dest),{recursive:true});
      if (rendered.has(file)) fs.writeFileSync(dest,rendered.get(file));
      else fs.copyFileSync(file,dest);
      fs.chmodSync(dest,fs.statSync(file).mode & 0o777);
    }
    fs.writeFileSync(path.join(stage,'SKILL.md'),templateText.replaceAll('{{VERSION}}',version));
    fs.mkdirSync(path.join(stage,'agents'),{recursive:true});
    fs.writeFileSync(path.join(stage,'agents/openai.yaml'),`interface:\n  display_name: "GD Agentic Skills Use"\n  short_description: "Route Godot tasks to focused skill references"\n  default_prompt: "Use $${skillName} to select the relevant Godot guidance for this task."\n`);
    fs.writeFileSync(path.join(stage,'UPSTREAM-LICENSE'),license);
    fs.writeFileSync(path.join(stage,'UPSTREAM.md'),`# Upstream provenance\n\nSource: https://github.com/thedivergentai/GD-Agentic-Skills\n\nCommit: ${commit}\n\nRouter version: ${routerVersion}\n\nUpstream license: see [UPSTREAM-LICENSE](UPSTREAM-LICENSE).\n\nPackaging changes: renamed skill entry documents to DOC.md; removed Markdown frontmatter (including mirrors); localized packaged upstream links; repaired resolvable mirror/sibling links; omitted per-skill agents configs and cache files. Scripts and assets are copied without content changes. Master mirrors are retained for their distinct relative script paths. See [manifest.json](manifest.json) for exact link repairs.\n`);
    const rows=names.map(n=> {
      const original=fs.readFileSync(path.join(source,n,'SKILL.md'),'utf8');
      const raw=original.match(/^description:\s*(.*)$/m)?.[1] || n;
      const summary=raw.replace(/^["']|["']$/g,'').split(/(?<=\.)\s/)[0].replaceAll('|','\\|');
      return `| [${n}](${n}/DOC.md) | ${summary} |`;
    });
    fs.writeFileSync(path.join(stage,'references/index.md'),`# Godot skill index\n\nChoose the topic matching the current task, then read only its document. Broad tasks start with [godot-master](godot-master/DOC.md).\n\n| Document | Focus |\n| --- | --- |\n${rows.join('\n')}\n`);
    fs.writeFileSync(path.join(stage,'manifest.json'),JSON.stringify({source:'https://github.com/thedivergentai/GD-Agentic-Skills',commit,version,skills:names,repairs},null,2)+'\n');
    require('./validate-generated-skill').validate(stage);
    fs.rmSync(output,{recursive:true,force:true});
    fs.renameSync(stage,output);
  } finally { fs.rmSync(stage,{recursive:true,force:true}); }
  console.log(`Generated ${names.length} documents at ${output} (${version}); ${repairs.length} link repairs.`);
}
function main() {
  const opts={source:'upstream/gd-agentic-skills/skills',output:`skills/${skillName}`,template:`templates/${skillName}-skill-template.md`};
  const args=process.argv.slice(2);
  for(let i=0;i<args.length;i++) {
    if (['--help','-h'].includes(args[i])) { console.log('Usage: npm run generate -- [--source <skills-dir>] [--output <dir>] [--template <file>]\nPaths resolve relative to this repository. Source must be a clean Git checkout.'); return; }
    const key=args[i].slice(2);
    if(!args[i].startsWith('--') || !(key in opts) || !args[i+1] || args[i+1].startsWith('--')) throw new Error(`Invalid option: ${args[i]}`);
    opts[key]=args[++i];
  }
  fs.mkdirSync(path.dirname(path.resolve(root,opts.output)),{recursive:true});
  generate(...['source','output','template'].map(k=>path.resolve(root,opts[k])));
}
if(require.main===module) { try { main(); } catch(e) {console.error(e.message);process.exitCode=1;} }
module.exports={generate};
