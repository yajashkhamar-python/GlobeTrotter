const fs = require('fs');

let code = fs.readFileSync('src/pages/Explore.jsx', 'utf8');

code = code.replace(/import '\.\/Explore\.css';/, "import './Explore.css';\nimport { getCityImg, getCountryImg, getActImg } from '../utils/imageResolver';");
code = code.replace(/<SafeImage src=\{c\.flags\.png\}/g, "<SafeImage src={getCountryImg(c.name.common)}");
code = code.replace(/<SafeImage src=\{city\.image\}/g, "<SafeImage src={getCityImg(city)}");
code = code.replace(/<SafeImage src=\{act\.image\}/g, "<SafeImage src={getActImg(act)}");
code = code.replace(/<SafeImage src=\{selectedCity\.image\}/g, "<SafeImage src={getCityImg(selectedCity)}");
code = code.replace(/<SafeImage src=\{selectedActivity\.image\}/g, "<SafeImage src={getActImg(selectedActivity)}");

fs.writeFileSync('src/pages/Explore.jsx', code);
