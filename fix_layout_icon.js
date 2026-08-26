const fs = require('fs');
let btn = fs.readFileSync('src/components/domain/AddToCartButton.tsx', 'utf8');

// Update prop type
btn = btn.replace(
  'layout?: "horizontal" | "vertical"',
  'layout?: "horizontal" | "vertical" | "icon"'
);

// If icon layout, return just the small button early
const iconBlock = `
  if (layout === "icon") {
    return (
      <button 
        onClick={handleAdd} 
        disabled={loading || added} 
        className="p-1.5 md:p-2 rounded-full hover:bg-primary/10 text-primary transition-colors disabled:opacity-50"
        title="Añadir a mi compra"
        type="button"
      >
        {added ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />}
      </button>
    )
  }

  return (`;

btn = btn.replace('return (\n    <div', iconBlock + '\n    <div');

fs.writeFileSync('src/components/domain/AddToCartButton.tsx', btn, 'utf8');
