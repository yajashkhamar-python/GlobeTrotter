import fs from 'fs';
import * as parser from '@babel/parser';
const code = fs.readFileSync('src/pages/TripDetails.jsx', 'utf8');
try { 
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] }); 
  console.log('OK'); 
} catch(e) { 
  console.error(e.message, e.loc); 
}
