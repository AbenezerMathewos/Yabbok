const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Use a simple array filter to remove duplicate import lines
const lines = content.split(/\r?\n/);
const uniqueLines = [];
let hasInfiniteMarquee = false;
let hasBackgroundGeometric = false;

for (let line of lines) {
    if (line.includes('import { InfiniteMarquee } from "@/components/ui/infinite-marquee";')) {
        if (!hasInfiniteMarquee) {
            uniqueLines.push(line);
            hasInfiniteMarquee = true;
        }
    } else if (line.includes('import { BackgroundGeometric } from "@/components/ui/background-geometric";')) {
        if (!hasBackgroundGeometric) {
            uniqueLines.push(line);
            hasBackgroundGeometric = true;
        }
    } else {
        uniqueLines.push(line);
    }
}

fs.writeFileSync(pagePath, uniqueLines.join('\n'));
console.log('Duplicates removed.');
