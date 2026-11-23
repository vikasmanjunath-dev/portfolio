// Prints the one-page summaries and résumé versions to PDF from the built site.
// Usage: npm run build && npx serve out -l 4300 &  then  node scripts/make-pdfs.mjs
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..'), CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const print = (path, file) => { execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${join(root, 'public', file)}`, '--virtual-time-budget=4000', `http://localhost:4300${path}`], { stdio: 'ignore' }); console.log('pdf', file); };
for (const s of readdirSync(join(root, 'out/print')).filter((x) => x !== 'resume' && !x.includes('.'))) print(`/print/${s}/`, `onepagers/${s}.pdf`);
for (const [v, n] of [['software', 'Software'], ['product', 'Product'], ['risk', 'Risk-Consulting']]) print(`/print/resume/${v}/`, `Vikas_Manjunath_Resume_${n}.pdf`);
// One attachment for applications: résumé first, then the four core one-pagers, then the five secondary ones.
const order = ['finos', 'vybes-lynk', 'akaarai', 'dueclock', 'onlymeta', 'relay-ai', 'nifty-analyser', 'syndicate', 'bunkbudget'];
execFileSync('pdfunite', [join(root, 'public/Vikas_Manjunath_Resume_Software.pdf'), ...order.map((s) => join(root, `public/onepagers/${s}.pdf`)), join(root, 'public/Vikas_Manjunath_Portfolio.pdf')]);
console.log('pdf Vikas_Manjunath_Portfolio.pdf');
