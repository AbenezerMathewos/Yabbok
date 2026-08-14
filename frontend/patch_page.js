const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Add imports
content = content.replace(
  'import { Magnetic } from "@/components/ui/magnetic";\r\n',
  'import { Magnetic } from "@/components/ui/magnetic";\r\nimport { InfiniteMarquee } from "@/components/ui/infinite-marquee";\r\nimport { BackgroundGeometric } from "@/components/ui/background-geometric";\r\n'
);
content = content.replace(
  'import { Magnetic } from "@/components/ui/magnetic";\n',
  'import { Magnetic } from "@/components/ui/magnetic";\nimport { InfiniteMarquee } from "@/components/ui/infinite-marquee";\nimport { BackgroundGeometric } from "@/components/ui/background-geometric";\n'
);

// 2. Wrap root and add BackgroundGeometric
content = content.replace(
  'return (\n    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans">\n      {/* Navigation */}',
  'return (\n    <>\n      <BackgroundGeometric />\n      <div className="min-h-screen flex flex-col font-sans relative z-0">\n        {/* Navigation */}'
);
content = content.replace(
  'return (\r\n    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans">\r\n      {/* Navigation */}',
  'return (\r\n    <>\r\n      <BackgroundGeometric />\r\n      <div className="min-h-screen flex flex-col font-sans relative z-0">\r\n        {/* Navigation */}'
);

content = content.replace(
  '        </div>\n      </footer>\n    </div>\n  );\n}',
  '        </div>\n      </footer>\n    </div>\n    </>\n  );\n}'
);
content = content.replace(
  '        </div>\r\n      </footer>\r\n    </div>\r\n  );\r\n}',
  '        </div>\r\n      </footer>\r\n    </div>\r\n    </>\r\n  );\r\n}'
);

// 3. Make Nav Transparent
content = content.replace(
  'className="fixed w-full z-50 transition-all duration-300 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 py-4"',
  'className="fixed w-full z-50 transition-all duration-300 bg-transparent py-4"'
);

// 4. Inject InfiniteMarquee
content = content.replace(
  '{/* BIBLE VERSE OF THE DAY */}',
  '{/* MARQUEE */}\n        <div className="py-8 border-y border-slate-200/50 dark:border-slate-800/50">\n          <InfiniteMarquee />\n        </div>\n\n        {/* BIBLE VERSE OF THE DAY */}'
);

// 5. Replace opaque backgrounds with transparent
content = content.replace(/bg-slate-50 dark:bg-slate-950\/50/g, 'bg-transparent');
content = content.replace(/bg-gold-50\/50 dark:bg-gold-950\/10/g, 'bg-transparent');
content = content.replace(/bg-white dark:bg-slate-950 overflow-hidden/g, 'bg-transparent overflow-hidden');
content = content.replace(/bg-slate-50 dark:bg-slate-900\/40/g, 'bg-white/20 dark:bg-slate-900/20');
content = content.replace(/bg-white dark:bg-slate-950/g, 'bg-transparent');
content = content.replace(/bg-slate-900 text-white relative overflow-hidden/g, 'bg-transparent text-white relative overflow-hidden');
content = content.replace(/bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 py-24 text-slate-950/g, 'bg-gradient-to-r from-gold-400/20 via-gold-500/20 to-amber-500/20 py-24 text-slate-100 backdrop-blur-md');

fs.writeFileSync(pagePath, content);
console.log('page.tsx successfully patched.');
