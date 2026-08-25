const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('page.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Jabbok2/frontend/src/app');

files.forEach(file => {
  if (file.replace(/\\/g, '/').endsWith('src/app/page.tsx')) return; // Skip homepage

  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/className="min-h-screen bg-transparent"/g, 'className="min-h-screen bg-slate-950/85 backdrop-blur-2xl"');
  content = content.replace(/className="flex h-screen items-center justify-center bg-transparent"/g, 'className="flex h-screen items-center justify-center bg-slate-950/85 backdrop-blur-2xl"');
  content = content.replace(/className="flex h-screen bg-transparent overflow-hidden"/g, 'className="flex h-screen bg-slate-950/85 backdrop-blur-2xl overflow-hidden"');
  content = content.replace(/className="min-h-screen bg-transparent flex flex-col"/g, 'className="min-h-screen bg-slate-950/85 backdrop-blur-2xl flex flex-col"');
  content = content.replace(/className="flex-1 flex items-center justify-center bg-transparent px-6 py-12"/g, 'className="flex-1 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl px-6 py-12"');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added frosted glass to: ' + file);
  }
});