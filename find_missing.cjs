const fs = require('fs');
const path = require('path');
const { translations } = require('./src/i18n/translations.js');
const en = translations.en;

function getMissing(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getMissing(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = [...content.matchAll(/t\(['"]([^'"]+)['"]\)/g)];
      matches.forEach(m => {
        const keyPath = m[1].split('.');
        let val = en;
        for (const k of keyPath) {
          val = val ? val[k] : undefined;
        }
        if (val === undefined) {
          console.log('MISSING:', m[1], 'in', fullPath);
        }
      });
    }
  });
}

getMissing('./src');
