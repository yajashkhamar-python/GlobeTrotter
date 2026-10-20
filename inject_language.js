import fs from 'fs';
import path from 'path';

const SRC_DIR = './src/pages';
const COMPONENTS_DIR = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has useLanguage
  if (content.includes('useLanguage')) return;

  // Find the import block and insert our import
  content = content.replace(/(import React.*?;\n)/, "$1import { useLanguage } from '../context/LanguageContext';\n");

  // Find component definitions and inject const { t } = useLanguage();
  content = content.replace(/(export default function \w+\(.*?\)\s*\{)/g, "$1\n  const { t } = useLanguage();\n");
  
  // Also handle const Component = () => {
  content = content.replace(/(const \w+\s*=\s*\(\)\s*=>\s*\{)/g, "$1\n  const { t } = useLanguage();\n");

  fs.writeFileSync(filePath, content);
}

// Process important pages
['Dashboard.jsx', 'MyTrips.jsx', 'CreateTrip.jsx', 'Explore.jsx', 'Calendar.jsx', 'Budget.jsx', 'Saved.jsx', 'Profile.jsx'].forEach(file => {
  const fp = path.join(SRC_DIR, file);
  if (fs.existsSync(fp)) {
    processFile(fp);
    console.log('Processed', fp);
  }
});

// Process layout components
['AppLayout.jsx', 'Sidebar.jsx', 'Header.jsx'].forEach(file => {
  const fp = path.join(COMPONENTS_DIR, 'layout', file);
  if (fs.existsSync(fp)) {
    // Need different import path for layout
    let content = fs.readFileSync(fp, 'utf8');
    if (!content.includes('useLanguage')) {
      content = content.replace(/(import React.*?;\n)/, "$1import { useLanguage } from '../../context/LanguageContext';\n");
      content = content.replace(/(export default function \w+\(.*?\)\s*\{)/g, "$1\n  const { t } = useLanguage();\n");
      fs.writeFileSync(fp, content);
      console.log('Processed', fp);
    }
  }
});
