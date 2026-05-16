/*
  VBS Free Tuition — Project Modularization Helper
  Run from: New folder (2)\ 
  Usage: node modularize.js
  
  SAFE: Read-only analysis. Writes new files. Does NOT modify index.html.
  After running, review new files, then manually update index.html links.
*/

const fs = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'index.html');
const content = fs.readFileSync(HTML_FILE, 'utf8');
const lines = content.split('\n');

console.log(`Total lines: ${lines.length}`);
console.log(`Total size: ${(content.length / 1024).toFixed(1)} KB`);

// ── Find <style> block (first big one = main CSS) ──────────────────
let styleStart = -1, styleEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (styleStart === -1 && lines[i].trim() === '<style>') {
    styleStart = i;
  } else if (styleStart !== -1 && styleEnd === -1 && lines[i].trim() === '</style>') {
    styleEnd = i;
    break;
  }
}
console.log(`\nMain <style> block: lines ${styleStart+1}–${styleEnd+1}`);

// Extract full CSS
const cssContent = lines.slice(styleStart + 1, styleEnd).join('\n');

// Split into: animations (keyframes), responsive (media), rest (style.css)
const keyframeBlocks = [];
const mediaBlocks = [];
const mainCSS = [];

const cssLines = cssContent.split('\n');
let i = 0;
while (i < cssLines.length) {
  const trimmed = cssLines[i].trim();
  
  if (trimmed.startsWith('@keyframes')) {
    // Collect full keyframe block
    let block = [];
    let depth = 0;
    while (i < cssLines.length) {
      block.push(cssLines[i]);
      const opens = (cssLines[i].match(/\{/g) || []).length;
      const closes = (cssLines[i].match(/\}/g) || []).length;
      depth += opens - closes;
      i++;
      if (depth <= 0 && block.length > 1) break;
    }
    keyframeBlocks.push(block.join('\n'));
  } else if (trimmed.startsWith('@media')) {
    // Collect full media block
    let block = [];
    let depth = 0;
    while (i < cssLines.length) {
      block.push(cssLines[i]);
      const opens = (cssLines[i].match(/\{/g) || []).length;
      const closes = (cssLines[i].match(/\}/g) || []).length;
      depth += opens - closes;
      i++;
      if (depth <= 0 && block.length > 1) break;
    }
    mediaBlocks.push(block.join('\n'));
  } else {
    mainCSS.push(cssLines[i]);
    i++;
  }
}

// Ensure output dirs exist
['css', 'js', 'games'].forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

// Write CSS files
const cssHeader = `/* ================================================================
   VBS Free Tuition — vbscomputersystem.in
   Auto-extracted from index.html
   ================================================================ */\n\n`;

fs.writeFileSync(path.join(__dirname, 'css', 'style.css'),
  cssHeader + mainCSS.join('\n'), 'utf8');

fs.writeFileSync(path.join(__dirname, 'css', 'animations.css'),
  cssHeader + '/* ── All @keyframes animations ── */\n\n' + keyframeBlocks.join('\n\n'), 'utf8');

fs.writeFileSync(path.join(__dirname, 'css', 'responsive.css'),
  cssHeader + '/* ── All @media responsive rules ── */\n\n' + mediaBlocks.join('\n\n'), 'utf8');

console.log(`\n✅ CSS extracted:`);
console.log(`   css/style.css        — ${(mainCSS.join('\n').length/1024).toFixed(1)} KB (${mainCSS.length} lines)`);
console.log(`   css/animations.css   — ${keyframeBlocks.length} @keyframes blocks`);
console.log(`   css/responsive.css   — ${mediaBlocks.length} @media blocks`);

// ── Find main <script> block ───────────────────────────────────────
// The main script starts after all the HTML content and before the game overlays
let scriptBlocks = [];
let inScript = false;
let scriptStart = -1;
let scriptNum = 0;

for (let j = 0; j < lines.length; j++) {
  const t = lines[j].trim();
  if (!inScript && (t === '<script>' || t.startsWith('<script>') && !t.includes('src='))) {
    inScript = true;
    scriptStart = j;
    scriptNum++;
  } else if (inScript && t === '</script>') {
    inScript = false;
    const scriptContent = lines.slice(scriptStart + 1, j).join('\n');
    scriptBlocks.push({ start: scriptStart + 1, end: j, content: scriptContent, num: scriptNum });
  }
}

console.log(`\nFound ${scriptBlocks.length} inline <script> blocks:`);
scriptBlocks.forEach((s, i) => {
  const lineCount = s.content.split('\n').length;
  const sizeKB = (s.content.length / 1024).toFixed(1);
  console.log(`   Script #${i+1}: lines ${s.start}–${s.end} (${lineCount} lines, ${sizeKB} KB)`);
});

// Write the largest script block (main AI/UI logic) to js/main.js
if (scriptBlocks.length > 0) {
  // First big script is usually the main one
  const mainScript = scriptBlocks.reduce((a, b) => a.content.length > b.content.length ? a : b);
  
  const jsHeader = `// ================================================================
// VBS Free Tuition — Main JavaScript
// vbscomputersystem.in
// Auto-extracted from index.html
// ================================================================\n\n`;
  
  fs.writeFileSync(path.join(__dirname, 'js', 'main.js'),
    jsHeader + mainScript.content, 'utf8');
  
  console.log(`\n✅ Main JS extracted to js/main.js (${(mainScript.content.length/1024).toFixed(1)} KB)`);
}

// ── Write report ──────────────────────────────────────────────────
const report = `
VBS FREE TUITION — MODULARIZATION REPORT
Generated: ${new Date().toLocaleString()}
=====================================================

FILES CREATED:
  css/style.css        — Main styles (${mainCSS.length} lines)
  css/animations.css   — @keyframes blocks (${keyframeBlocks.length} blocks)
  css/responsive.css   — @media queries (${mediaBlocks.length} blocks)
  js/main.js           — Main JavaScript logic

NEXT STEPS (Manual):
1. Review each new file for correctness
2. In index.html, REPLACE the <style>...</style> block with:
   <link rel="stylesheet" href="css/style.css">
   <link rel="stylesheet" href="css/animations.css">
   <link rel="stylesheet" href="css/responsive.css">
3. REPLACE the main <script>...</script> block with:
   <script src="js/main.js"></script>
4. Upload ALL files to Hostinger

GAME FILES (already modular):
  games/coding-game.js — ✅ Code Magic (separate file)
  Math/ABCD/Hindi games — Still in index.html (complex extraction needed)

NOTE: index.html was NOT modified. Safe to review new files first.
`;

fs.writeFileSync(path.join(__dirname, 'MODULARIZATION_REPORT.txt'), report, 'utf8');
console.log('\n📋 Report saved to MODULARIZATION_REPORT.txt');
console.log('\n✅ Done! index.html was NOT modified. Review new files before linking.');
