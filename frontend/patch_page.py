import os
import re

filepath = r"c:\Jabbok2\frontend\src\app\page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add BackgroundGeometric import if missing
if "import { BackgroundGeometric }" not in content:
    content = content.replace(
        'import { InfiniteMarquee } from "@/components/ui/infinite-marquee";',
        'import { InfiniteMarquee } from "@/components/ui/infinite-marquee";\nimport { BackgroundGeometric } from "@/components/ui/background-geometric";'
    )

# Clean duplicates
content = re.sub(r'(import { BackgroundGeometric } from "@/components/ui/background-geometric";\s*){2,}', r'\1', content)
content = re.sub(r'(import { InfiniteMarquee } from "@/components/ui/infinite-marquee";\s*){2,}', r'\1', content)

# 2. Add BackgroundGeometric to root
if "<BackgroundGeometric />" not in content:
    content = content.replace(
        'return (\n    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans">\n      {/* Navigation */}',
        'return (\n    <>\n      <BackgroundGeometric />\n      <div className="min-h-screen flex flex-col font-sans relative z-0">\n        {/* Navigation */}'
    )
    content = content.replace(
        'return (\r\n    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans">\r\n      {/* Navigation */}',
        'return (\r\n    <>\r\n      <BackgroundGeometric />\r\n      <div className="min-h-screen flex flex-col font-sans relative z-0">\r\n        {/* Navigation */}'
    )

# 3. Add closing Fragment if opened
if "<BackgroundGeometric />" in content and "</>\n  );\n}" not in content and "</>\r\n  );\r\n}" not in content:
    content = content.replace(
        '        </div>\n      </footer>\n    </div>\n  );\n}',
        '        </div>\n      </footer>\n    </div>\n    </>\n  );\n}'
    )
    content = content.replace(
        '        </div>\r\n      </footer>\r\n    </div>\r\n  );\r\n}',
        '        </div>\r\n      </footer>\r\n    </div>\r\n    </>\r\n  );\r\n}'
    )

# 4. Make nav transparent
content = content.replace(
    'className="fixed w-full z-50 transition-all duration-300 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 py-4"',
    'className="fixed w-full z-50 transition-all duration-300 bg-transparent py-4"'
)

# 5. Make sections transparent
content = content.replace('bg-slate-50 dark:bg-slate-950/50', 'bg-transparent')
content = content.replace('bg-gold-50/50 dark:bg-gold-950/10', 'bg-transparent')
content = content.replace('bg-white dark:bg-slate-950 overflow-hidden', 'bg-transparent overflow-hidden')
content = content.replace('bg-slate-50 dark:bg-slate-900/40', 'bg-white/20 dark:bg-slate-900/20')
content = content.replace('bg-white dark:bg-slate-950', 'bg-transparent')
content = content.replace('bg-slate-900 text-white relative overflow-hidden', 'bg-transparent text-white relative overflow-hidden')
content = content.replace(
    'bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 py-24 text-slate-950',
    'bg-gradient-to-r from-gold-400/20 via-gold-500/20 to-amber-500/20 py-24 text-slate-100 backdrop-blur-md'
)

# Add Marquee (idempotent)
if "import { InfiniteMarquee }" in content and "<InfiniteMarquee />" not in content:
    content = content.replace(
        '{/* BIBLE VERSE OF THE DAY */}',
        '{/* MARQUEE */}\n        <div className="py-8 border-y border-slate-200/50 dark:border-slate-800/50">\n          <InfiniteMarquee />\n        </div>\n\n        {/* BIBLE VERSE OF THE DAY */}'
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("page.tsx python patch complete!")
