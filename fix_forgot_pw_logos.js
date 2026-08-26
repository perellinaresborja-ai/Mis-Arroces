const fs = require('fs');
let content = fs.readFileSync('src/app/forgot-password/page.tsx', 'utf8');

// 1. Remove the left "M" logo
const leftLogoBlock = `<div className="relative w-16 h-16 md:w-20 md:h-20">
            <Image 
              src="/mwh.png" 
              alt="Símbolo Mis Arroces" 
              fill
              className="object-contain object-left-top drop-shadow-2xl"
            />
          </div>`;
content = content.replace(leftLogoBlock, "");

// 2. Change justify-between to justify-end on the left wrapper
content = content.replace(
  'className="absolute inset-0 flex flex-col p-12 md:p-16 lg:p-24 justify-between z-10"',
  'className="absolute inset-0 flex flex-col p-12 md:p-16 lg:p-24 justify-end z-10"'
);

// 3. Update the right logo
const rightLogoBlock = `<div className="relative w-40 h-40 lg:w-56 lg:h-56">
            <Image 
              src="/logopng.png" 
              alt="Mis Arroces" 
              fill
              className="object-contain"
              priority
            />
          </div>`;
          
const newRightLogoBlock = `<div className="relative w-64 h-24 mb-4">
            <Image 
              src="/mpng.png" 
              alt="Mis Arroces" 
              fill
              className="object-contain"
              priority
            />
          </div>`;
content = content.replace(rightLogoBlock, newRightLogoBlock);

fs.writeFileSync('src/app/forgot-password/page.tsx', content, 'utf8');
