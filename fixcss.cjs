const fs = require('fs'); 
let c = fs.readFileSync('src/pages/Dashboard.css', 'utf8'); 
c = c.substring(0, c.indexOf('" \\ n / *')); 
fs.writeFileSync('src/pages/Dashboard.css', c + `
/* Animations & Polish */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { 
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
  opacity: 0; 
}
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
.delay-5 { animation-delay: 0.5s; }
.delay-6 { animation-delay: 0.6s; }
.hover-lift {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.08);
}
.img-zoom-container { overflow: hidden; }
.img-zoom-container img, .img-zoom-container .dash-hero-img {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.hover-lift:hover .img-zoom-container img { transform: scale(1.05); }
`);
