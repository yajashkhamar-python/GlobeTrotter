const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'InteractiveMap', 'InteractiveMap.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Fit All button to also have a Reset button next to it
const oldButtons = `<button className="imap-btn-fit" onClick={handleFitAll}>
            <Maximize size={16} /> <span className="imap-btn-text">Fit All</span>
          </button>`;

const newButtons = `<button className="imap-btn-fit" onClick={handleFitAll}>
            <Maximize size={16} /> <span className="imap-btn-text">Fit All</span>
          </button>
          <button className="imap-btn-fit" style={{background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)'}} onClick={() => { setSelectedDay('all'); handleFitAll(); }}>
            <span className="imap-btn-text">Reset</span>
          </button>`;

content = content.replace(oldButtons, newButtons);
fs.writeFileSync(filePath, content);
console.log('Added Reset button');
