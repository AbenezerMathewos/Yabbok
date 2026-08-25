const fs = require('fs');
const file = 'c:/Jabbok2/frontend/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Hero
content = content.replace('bg-slate-900 text-white py-24 sm:py-32', 'bg-transparent text-white py-24 sm:py-40');
content = content.replace('<div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-gold-950/40"></div>', '<div className="absolute inset-0 bg-gradient-to-tr from-slate-950/50 via-transparent to-gold-950/20"></div>');

// Stats
content = content.replace('bg-transparent text-white relative overflow-hidden', 'bg-transparent text-white relative overflow-hidden'); // Stats is already transparent maybe? Let's check.
// Wait, the original stats was:
content = content.replace('bg-transparent text-white relative overflow-hidden\n          <div className="absolute inset-0 bg-cover bg-center opacity-10"', 'bg-transparent text-white relative overflow-hidden\n          {/* Removed solid bg */}\n          <div className="absolute inset-0 bg-cover bg-center opacity-10"');

// Core Values
content = content.replace('bg-white/20 dark:bg-slate-900/20', 'bg-transparent');

fs.writeFileSync(file, content, 'utf8');