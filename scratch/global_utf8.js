const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const replacements = {
  'cÃ³mo': 'cómo',
  'CÃ“MO': 'CÓMO',
  'TÃ©cnica': 'Técnica',
  'ProporciÃ³n': 'Proporción',
  'ProporciÃƒÂ³n': 'Proporción',
  'mÃ³vil': 'móvil',
  'mÃƒÂ³vil': 'móvil',
  'duraciÃ³n': 'duración',
  'duraciÃƒÂ³n': 'duración',
  'aÃºn': 'aún',
  'aÃƒÂºn': 'aún',
  'AlÃ©rgenos': 'Alérgenos',
  'AlÃƒÂ©rgenos': 'Alérgenos',
  'NutriciÃ³n': 'Nutrición',
  'NutriciÃƒÂ³n': 'Nutrición',
  'InformaciÃ³n': 'Información',
  'InformaciÃƒÂ³n': 'Información',
  'CocciÃ³n': 'Cocción',
  'CocciÃƒÂ³n': 'Cocción',
  'Ãºltimo': 'último',
  'TodavÃa': 'Todavía',
  'estÃ¡n': 'están',
  'estÃ©': 'esté',
  'raciÃ³n': 'ración',
  'EstimaciÃ³n': 'Estimación',
  'EnergÃa': 'Energía',
  'ProteÃnas': 'Proteínas',
  'AzÃºcares': 'Azúcares',
  'AzÃºc.': 'Azúc.',
  'Â¿QuÃ©': '¿Qué',
  'contribuciÃ³n': 'contribución',
  'segÃºn': 'según',
  'Â·': '·',
  'Cocci\\xc3\\xb3n': 'Cocción' // Just in case it's escaped
};

const allFiles = walkSync(path.resolve('src'));
let totalFixed = 0;

allFiles.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  let orig = code;
  
  for (let i = 0; i < 3; i++) {
    for (const [bad, good] of Object.entries(replacements)) {
      code = code.split(bad).join(good);
    }
  }

  if (code !== orig) {
    fs.writeFileSync(f, code, 'utf8');
    console.log("Fixed " + f);
    totalFixed++;
  }
});

console.log(`Finished fixing ${totalFixed} files.`);
