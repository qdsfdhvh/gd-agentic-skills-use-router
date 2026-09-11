#!/usr/bin/env node
const {fs,path,root,skillName,walk,links,localTarget}=require('./lib');
function validate(dir) {
  dir=path.resolve(dir);
  const read=p=>fs.readFileSync(path.join(dir,p),'utf8');
  const entry=read('SKILL.md');
  if (!entry.startsWith(`---\nname: ${skillName}\n`) || !/^description: .+/m.test(entry)) throw new Error('Invalid skill frontmatter');
  if (/\{\{[^}]+\}\}/.test(entry)) throw new Error('Unresolved template variable');
  const manifest=JSON.parse(read('manifest.json'));
  if(!/^[a-f0-9]{40}$/.test(manifest.commit) || !entry.includes(`version: "${manifest.version}"`)) throw new Error('Missing or inconsistent pinned version');
  if(!read('agents/openai.yaml').includes('$'+skillName)) throw new Error('Missing invocation prompt');
  if(!read('UPSTREAM-LICENSE').includes('GNU LESSER GENERAL PUBLIC LICENSE')) throw new Error('Missing upstream license');
  for(const required of ['godot-master','godot-version-migration']) {
    if(!entry.includes(`references/${required}/DOC.md`)) throw new Error(`Missing route: ${required}`);
  }
  const actual=fs.readdirSync(path.join(dir,'references'),{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name).sort();
  if(JSON.stringify(actual)!==JSON.stringify(manifest.skills)) throw new Error('Manifest and reference directories differ');
  for(const name of actual) {
    const doc=read(`references/${name}/DOC.md`);
    if(doc.startsWith('---\n')) throw new Error(`Frontmatter leaked: ${name}`);
    if(fs.existsSync(path.join(dir,'references',name,'agents'))) throw new Error(`Per-skill agents config leaked: ${name}`);
    if(!read('references/index.md').includes(`](${name}/DOC.md)`)) throw new Error(`Unindexed skill: ${name}`);
  }
  const errors=[];
  const files=walk(dir);
  for(const file of files) {
    if(path.basename(file)==='SKILL.md' && file!==path.join(dir,'SKILL.md')) errors.push(`Nested SKILL.md: ${file}`);
    if(!file.endsWith('.md')) continue;
    const text=fs.readFileSync(file,'utf8');
    for(const link of links(text)) {
      const target=localTarget(file,link);
      if(target && (!target.startsWith(dir+path.sep) || !fs.existsSync(target))) errors.push(`${path.relative(dir,file)}: ${link}`);
    }
  }
  if(errors.length) throw new Error(`Broken local links:\n${errors.join('\n')}`);
  console.log(`Validated ${actual.length} skill references and ${files.length} packaged files.`);
}
if(require.main===module) {try {validate(process.argv[2] || path.join(root,'skills',skillName));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={validate};
