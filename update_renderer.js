const fs = require('fs');

let renderer = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

const missingOverlays = `
        case 'DRAWING':
          return (
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
              {overlay.payload.paths.map((p: any, i: number) => (
                <polyline key={i} points={p.points.map((pt: any) => \`\${pt.x},\${pt.y}\`).join(' ')} fill="none" stroke={p.color} strokeWidth={p.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
              ))}
            </svg>
          );
        case 'MENTION':
        case 'PROFILE':
          return <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md cursor-pointer pointer-events-auto" onPointerDown={e => e.stopPropagation()}>@{overlay.payload.username}</div>;
        case 'LOCATION':
          return <div className="bg-white/90 text-black px-3 py-1 rounded-full text-sm font-bold shadow-md flex items-center gap-1 cursor-pointer pointer-events-auto" onPointerDown={e => e.stopPropagation()}>📍 {overlay.payload.name}</div>;
        case 'INGREDIENT':
          return <div className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-bold shadow-md cursor-pointer pointer-events-auto" onPointerDown={e => e.stopPropagation()}>🥕 {overlay.payload.name}</div>;
        case 'SESSION':
          return <div className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg cursor-pointer pointer-events-auto flex flex-col" onPointerDown={e => e.stopPropagation()}><span>Cocinado por</span><span className="text-lg">{overlay.payload.authorName}</span></div>;
        case 'RECIPE':
          return <div className="bg-orange-500 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg cursor-pointer pointer-events-auto flex flex-col" onPointerDown={e => e.stopPropagation()}><span>Ver receta:</span><span className="text-xl">{overlay.payload.title}</span></div>;
        case 'GIF':
          return <img src={overlay.payload.url} className="w-32 object-contain pointer-events-auto" onPointerDown={e => e.stopPropagation()} />;
`;

if (!renderer.includes('case \'DRAWING\':')) {
  renderer = renderer.replace(/case 'TEXT':/g, missingOverlays + '\n        case \'TEXT\':');
  
  // also add multiple styles support to TEXT
  renderer = renderer.replace(
    /<div style=\{\{ color: overlay.payload.color/g,
    `<div style={{ color: overlay.payload.color, backgroundColor: overlay.payload.backgroundColor, fontFamily: overlay.payload.fontFamily, textAlign: overlay.payload.align, textShadow: overlay.payload.textShadow }}`
  );
  
  fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', renderer);
}
