const fs = require('fs');
const path = require('path');

// CSS Modulesファイルのパス
const cssFilePath = path.join(__dirname, 'app/reserve/page.module.css');

// ファイルを読み込み
let content = fs.readFileSync(cssFilePath, 'utf8');

// グローバルセレクターを:global()で囲む
const globalSelectors = [
  'html',
  'a',
  'main a',
  'main a:hover:not([disabled], .disabled)',
  'dt',
  'h1',
  'li',
  'p',
  'select',
  'dd',
  'img',
  'button',
  'ul',
  'main',
  'header'
];

// 各セレクターを修正
globalSelectors.forEach(selector => {
  // セレクターが既に:global()で囲まれていない場合のみ修正
  if (!selector.startsWith(':global(')) {
    const regex = new RegExp(`(^|\\s|,)\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*{`, 'gm');
    content = content.replace(regex, `$1:global(${selector}) {`);
  }
});

// ファイルに書き戻し
fs.writeFileSync(cssFilePath, content, 'utf8');

console.log('CSS Modulesファイルのグローバルセレクターを修正しました。');