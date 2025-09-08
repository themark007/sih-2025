const fs = require('fs');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');

(async () => {
  try {
    const input = fs.readFileSync('./src/index.css', 'utf8');
    const result = await postcss([tailwind(), autoprefixer()]).process(input, { from: './src/index.css' });
    fs.mkdirSync('dist', { recursive: true });
    fs.writeFileSync('./dist/tailwind-built.css', result.css);
    console.log('Wrote ./dist/tailwind-built.css — size:', result.css.length);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
