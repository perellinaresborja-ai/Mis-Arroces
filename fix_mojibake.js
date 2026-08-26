const fs = require('fs');
const path = require('path');

const replacements = {
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã±': 'ñ',
  'Ã‘': 'Ñ',
  'Ã ': 'Á',
  'Ã‰': 'É',
  'Ã\xAD': 'í', // Sometimes it's a special char
  'AÃ±adir': 'Añadir',
  'aÃ±adidos': 'añadidos',
  'InformaciÃ³n': 'Información',
  'BÃ¡sica': 'Básica',
  'DescripciÃ³n': 'Descripción',
  'PÃºblico': 'Público',
  'quiÃ©n': 'quién',
  'estÃ©': 'esté',
  'TÃ©cnicos': 'Técnicos',
  'FÃ¡cil': 'Fácil',
  'DifÃ­cil': 'Difícil',
  'CocciÃ³n': 'Cocción',
  'DiÃ¡metro': 'Diámetro',
  'ElaboraciÃ³n': 'Elaboración',
  'SofreÃ­r': 'Sofreír',
  'DuraciÃ³n': 'Duración',
  'PrÃ³ximamente': 'Próximamente',
  'AÃºn': 'Aún',
  'secciÃ³n': 'sección',
  'todavÃ­a': 'todavía',
  'Ãš': 'Ú'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [bad, good] of Object.entries(replacements)) {
    // Replace globally
    content = content.split(bad).join(good);
  }

  if (content !== original) {
    console.log('Fixed:', filePath);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(processFile);

console.log("Done");
