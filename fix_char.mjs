import fs from 'fs';
import path from 'path';

const filePath = 'C:\\Users\\aayus\\WebstormProjects\\xordium-website-5.0\\src\\frontend\\app\\admin\\events\\page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic > character with >
const fixedContent = content.replace(
  'Markdown supported - **bold**, *italic*, - lists, > quotes,',
  'Markdown supported - **bold**, *italic*, - lists, > quotes,'
);

fs.writeFileSync(filePath, fixedContent, 'utf8');
console.log('Fixed the > character in JSX');