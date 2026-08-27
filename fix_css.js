const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

css += `
/* HIDE SCROLLBARS EVERYWHERE FOR A CLEANER LOOK */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
  display: none;
}
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
`;

fs.writeFileSync('src/app/globals.css', css);
