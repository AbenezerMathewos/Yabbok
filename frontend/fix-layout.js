const fs = require('fs');

let layout = fs.readFileSync('c:/Jabbok2/frontend/src/app/layout.tsx', 'utf8');
layout = layout.replace('import { ScrollProgress } from "@/components/ui/scroll-progress";', 'import { ScrollProgress } from "@/components/ui/scroll-progress";\nimport { VantaBackground } from "@/components/ui/vanta-background";');
layout = layout.replace('<body className="min-h-screen bg-background text-foreground antialiased">', '<body className="min-h-screen bg-transparent text-foreground antialiased">');
layout = layout.replace('<ServiceWorkerRegister />', '<ServiceWorkerRegister />\n                <VantaBackground />');
fs.writeFileSync('c:/Jabbok2/frontend/src/app/layout.tsx', layout, 'utf8');
console.log("Fixed layout");