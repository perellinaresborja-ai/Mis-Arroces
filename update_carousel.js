const fs = require('fs');

let code = fs.readFileSync('src/components/domain/MediaCarousel.tsx', 'utf8');

if (!code.includes('href?: string')) {
  // Add href prop
  code = code.replace(
    /export function MediaCarousel\(\{ items, bucket = "recipe_media" \}: \{ items: MediaItem\[\], bucket\?: string \}\) \{/,
    `import Link from "next/link";\nexport function MediaCarousel({ items, bucket = "recipe_media", href }: { items: MediaItem[], bucket?: string, href?: string }) {`
  );

  // Stop propagation on buttons
  code = code.replace(
    /const next = \(\) => setCurrentIndex\(prev => \(prev \+ 1\) % items\.length\)/,
    `const next = (e?: React.MouseEvent) => { e?.preventDefault(); e?.stopPropagation(); setCurrentIndex(prev => (prev + 1) % items.length) }`
  );
  code = code.replace(
    /const prev = \(\) => setCurrentIndex\(prev => \(prev - 1 \+ items\.length\) % items\.length\)/,
    `const prev = (e?: React.MouseEvent) => { e?.preventDefault(); e?.stopPropagation(); setCurrentIndex(prev => (prev - 1 + items.length) % items.length) }`
  );

  // Wrap image
  const imageElement = `<Image src={getImageUrl(items[currentIndex].storage_path)} alt={\`Media \${currentIndex + 1}\`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" priority={currentIndex === 0} />`;
  const wrappedImage = `{href ? (
        <Link href={href} className="absolute inset-0">
          ${imageElement}
        </Link>
      ) : (
        ${imageElement}
      )}`;
  
  code = code.replace(
    /<Image src=\{getImageUrl\(items\[currentIndex\]\.storage_path\)\}.*?\/>/,
    wrappedImage
  );

  fs.writeFileSync('src/components/domain/MediaCarousel.tsx', code);
  console.log('Updated MediaCarousel to support href');
}
