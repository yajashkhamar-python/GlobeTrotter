const fs = require('fs');
const file = 'src/pages/TripDetails.jsx';
let content = fs.readFileSync(file, 'utf8');

const itinStart = content.indexOf('{/* Daily Itinerary Panel */}');
const discStartRaw = content.indexOf('DISCOVER ACTIVITIES');
const trueDiscStart = content.lastIndexOf('{/*', discStartRaw);

const rightPanelStr = 'RIGHT PANEL';
const rightPanelIndex = content.indexOf(rightPanelStr, discStartRaw);
const trueRightStart = content.lastIndexOf('{/*', rightPanelIndex);

const discEnd = content.lastIndexOf('</div>', content.lastIndexOf('</div>', trueRightStart - 1) - 1);

if (itinStart > -1 && trueDiscStart > -1 && discEnd > -1) {
  const itinBlock = content.substring(itinStart, trueDiscStart);
  
  // We want to grab everything from trueDiscStart up to the div closure before RIGHT PANEL
  const discBlock = content.substring(trueDiscStart, trueRightStart);
  
  // Swap them! But wait, they are inside `<div className="td-center">`!
  // So:
  // Before itin: content.substring(0, itinStart)
  // New disc block: discBlock
  // New itin block: itinBlock
  // After disc block: content.substring(trueRightStart)

  const newContent = content.substring(0, itinStart) + discBlock + itinBlock + content.substring(trueRightStart);
  fs.writeFileSync(file, newContent);
  console.log('Swapped successfully!');
} else {
  console.log('Failed to find markers', itinStart, trueDiscStart, rightPanelIndex);
}
