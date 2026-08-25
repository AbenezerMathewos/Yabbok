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
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/className="min-h-screen bg-background"/g, 'className="min-h-screen bg-transparent"');
  content = content.replace(/className="flex h-screen items-center justify-center bg-background"/g, 'className="flex h-screen items-center justify-center bg-transparent"');
  content = content.replace(/className="flex h-screen bg-background overflow-hidden"/g, 'className="flex h-screen bg-transparent overflow-hidden"');
  content = content.replace(/className="min-h-screen bg-background flex flex-col"/g, 'className="min-h-screen bg-transparent flex flex-col"');
  content = content.replace(/className="flex-1 flex items-center justify-center bg-background px-6 py-12"/g, 'className="flex-1 flex items-center justify-center bg-transparent px-6 py-12"');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Made transparent: ' + file);
  }
});