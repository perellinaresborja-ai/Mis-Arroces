const fs = require('fs');
const path = require('path');

const files = [
  'src/app/recipes/[id]/page.tsx',
  'src/components/domain/InteractiveRecipeView.tsx',
  'src/components/domain/cook-mode/CookModeClient.tsx',
  'src/components/domain/NutritionSection.tsx'
];

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
  'Â·': '·'
};

files.forEach(f => {
  const p = path.resolve(f);
  if (!fs.existsSync(p)) return;
  let code = fs.readFileSync(p, 'utf8');
  let orig = code;
  
  // Replace multiple times to unwrap double encodings
  for (let i = 0; i < 3; i++) {
    for (const [bad, good] of Object.entries(replacements)) {
      code = code.split(bad).join(good);
    }
  }

  if (code !== orig) {
    fs.writeFileSync(p, code, 'utf8');
    console.log("Fixed " + f);
  }
});
