const fs = require('fs');

// Fix layout.tsx
let layout = fs.readFileSync('c:/Jabbok2/frontend/src/app/layout.tsx', 'utf8');
layout = layout.replace('import { MouseGlow } from "@/components/ui/mouse-glow";', 'import { MouseGlow } from "@/components/ui/mouse-glow";\nimport { VantaBackground } from "@/components/ui/vanta-background";');
layout = layout.replace('<body className="min-h-screen bg-background text-foreground antialiased">', '<body className="min-h-screen bg-transparent text-foreground antialiased">');
layout = layout.replace('<MouseGlow />', '<MouseGlow />\n                <VantaBackground />');
fs.writeFileSync('c:/Jabbok2/frontend/src/app/layout.tsx', layout, 'utf8');

// Fix globals.css
let css = fs.readFileSync('c:/Jabbok2/frontend/src/app/globals.css', 'utf8');
css = css.replace('@apply antialiased bg-background text-foreground selection:bg-gold-500/30;', '@apply antialiased text-foreground selection:bg-gold-500/30;');
fs.writeFileSync('c:/Jabbok2/frontend/src/app/globals.css', css, 'utf8');

console.log("Vanta re-injected into layout.tsx and globals.css");