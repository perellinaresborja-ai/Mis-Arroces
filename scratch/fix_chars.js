const fs = require('fs');
const path = require('path');

const fixBrokenChars = (filePath) => {
  let code = fs.readFileSync(filePath, 'utf8');
  const initialCode = code;

  const replacements = {
    'cÃ³mo': 'cómo',
    'CÃ“MO': 'CÓMO',
    'Ficha TÃ©cnica': 'Ficha Técnica',
    'ProporciÃ³n': 'Proporción',
    'ProporciÃƒÂ³n': 'Proporción',
    'mÃƒÂ³vil': 'móvil',
    'duraciÃƒÂ³n': 'duración',
    'duraciÃ³n': 'duración',
    'aÃƒÂºn': 'aún',
    'aÃºn': 'aún',
    'AlÃƒÂ©rgenos': 'Alérgenos',
    'AlÃ©rgenos': 'Alérgenos',
    'NutriciÃƒÂ³n': 'Nutrición',
    'NutriciÃ³n': 'Nutrición',
    'InformaciÃƒÂ³n': 'Información',
    'InformaciÃ³n': 'Información',
    'CocciÃƒÂ³n': 'Cocción',
    'CocciÃ³n': 'Cocción',
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

  for (const [broken, fixed] of Object.entries(replacements)) {
    code = code.split(broken).join(fixed);
  }

  if (code !== initialCode) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`Fixed characters in ${path.basename(filePath)}`);
  }
};

const files = [
  'src/app/recipes/[id]/page.tsx',
  'src/components/domain/InteractiveRecipeView.tsx',
  'src/components/domain/cook-mode/CookModeClient.tsx',
  'src/components/domain/NutritionSection.tsx'
];

files.forEach(f => fixBrokenChars(path.resolve(f)));
