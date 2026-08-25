
const fs = require('fs');
const glob = require('glob');
const files = glob.sync('c:/Jabbok2/frontend/src/app/**/page.tsx');
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
    console.log('Updated ' + file);
  }
});

