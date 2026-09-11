const {test}=require('node:test');
const assert=require('node:assert/strict');
const os=require('node:os');
const {execFileSync}=require('node:child_process');
const {fs,path,root,walk}=require('../scripts/lib');
const {generate}=require('../scripts/generate-gd-agentic-skills-use');
const {validate}=require('../scripts/validate-generated-skill');
const source=path.join(root,'upstream/gd-agentic-skills/skills');
const template=path.join(root,'templates/gd-agentic-skills-use-skill-template.md');
const generated=path.join(root,'skills/gd-agentic-skills-use');
function temporary(t) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gd-router-test-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  return dir;
}
test('generation is reproducible and scripts/assets remain byte-identical',t=>{
  const output=path.join(temporary(t),'skill');
  generate(source,output,template);
  const packaged=walk(output);
  assert.deepEqual(packaged.map(p=>path.relative(output,p)),walk(generated).map(p=>path.relative(generated,p)));
  for(const file of packaged) assert.deepEqual(fs.readFileSync(file),fs.readFileSync(path.join(generated,path.relative(output,file))),file);
  for(const file of walk(source).filter(p=>!p.endsWith('.md'))) {
    assert.deepEqual(fs.readFileSync(file),fs.readFileSync(path.join(output,'references',path.relative(source,file))),file);
  }
});
test('unsafe custom output preserves existing files',t=>{
  const dir=temporary(t);
  fs.writeFileSync(path.join(dir,'keep'),'original');
  assert.throws(()=>generate(source,dir,template),/not this generated skill/);
  assert.equal(fs.readFileSync(path.join(dir,'keep'),'utf8'),'original');
  assert.throws(()=>generate(source,root,template),/overlaps/);
  assert.throws(()=>generate(source,source,template),/overlaps/);
});
test('validator detects a missing linked reference',t=>{
  const dir=path.join(temporary(t),'skill');
  fs.cpSync(generated,dir,{recursive:true});
  fs.appendFileSync(path.join(dir,'references/index.md'),'\n[missing](missing/DOC.md)\n');
  assert.throws(()=>validate(dir),/missing\/DOC.md/);
});
test('direct installer works with explicit temporary targets',t=>{
  const target=temporary(t);
  execFileSync(process.execPath,[path.join(root,'scripts/install-local.js')],{
    env:{...process.env,GD_AGENTIC_SKILLS_USE_INSTALL_TARGETS:target,GD_AGENTIC_SKILLS_USE_DIST_DIR:generated},stdio:'pipe'
  });
  validate(path.join(target,'skills/gd-agentic-skills-use'));
});
