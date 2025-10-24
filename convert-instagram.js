const fs = require('fs');

// Read the instagram.js file
const code = fs.readFileSync('./src/nodes/instagram.js', 'utf8');

// Remove the export default ` and `;
const cleanCode = code.replace(/^export default `/, '').replace(/`;[\s\S]*$/, '');

// JSON.stringify will properly escape it
const escaped = JSON.stringify(cleanCode);

// Write to a temp file
fs.writeFileSync('./instagram-escaped.txt', escaped);

console.log('Escaped code written to instagram-escaped.txt');
console.log('Length:', escaped.length);
