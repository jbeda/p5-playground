import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Boilerplate for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const sketchName = args[0];

if (!sketchName) {
  console.error('Please provide a sketch name: npm run new <sketch-name>');
  process.exit(1);
}

const sketchesDir = path.resolve(__dirname, '../sketches');
const templateDir = path.join(sketchesDir, '_template');
const newSketchDir = path.join(sketchesDir, sketchName);

if (fs.existsSync(newSketchDir)) {
  console.error(`Error: Sketch "${sketchName}" already exists.`);
  process.exit(1);
}

// Recursive copy function
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  copyRecursiveSync(templateDir, newSketchDir);
  console.log(`
✨ Created new sketch: ${sketchName}`);
  console.log(`   Location: sketches/${sketchName}/`);
  console.log(`
To run it, start the server with 'npm run dev' and navigate to /sketches/${sketchName}/
`);
} catch (err) {
  console.error('Error creating sketch:', err);
}
