const fs = require('fs');

let code = fs.readFileSync('src/components/domain/GlobalCreateMenu.tsx', 'utf8');

code = code.replace(
  /const options = \[\s*\{\s*label: "PublicaciÃ³n",\s*icon: ImageIcon,\s*href: "\/create\/post"\s*\},\s*\{\s*label: "Historia",\s*icon: Clock,\s*href: "\/create\/story"\s*\},\s*\{\s*label: "Nueva Receta",\s*icon: ChefHat,\s*href: "\/create\/recipe"\s*\}\s*\]/,
  `const options = [
    {
      label: "Publicación",
      icon: ImageIcon,
      href: "/create/post"
    },
    {
      label: "Historia (Foto/Vídeo)",
      icon: Clock,
      isFilePicker: true
    },
    {
      label: "Aa Texto (Historia)",
      icon: AlignLeft,
      href: "/create/story"
    },
    {
      label: "Nueva Receta",
      icon: ChefHat,
      href: "/create/recipe"
    }
  ]`
);

fs.writeFileSync('src/components/domain/GlobalCreateMenu.tsx', code);
console.log('Fixed GlobalCreateMenu options');
