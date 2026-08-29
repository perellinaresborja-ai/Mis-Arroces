const fs = require('fs');

let code = fs.readFileSync('src/components/domain/GlobalCreateMenu.tsx', 'utf8');

code = code.replace(
  /import \{ cn \} from "@\/lib\/utils"/,
  `import { cn } from "@/lib/utils"
import { setGlobalStoryDraft } from "@/lib/story-draft"
import { AlignLeft } from "lucide-react"`
);

code = code.replace(
  /const router = useRouter\(\)/,
  `const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)`
);

code = code.replace(
  /const options = \[\n\s*\{\n\s*label: "PublicaciÃ³n",\n\s*icon: ImageIcon,\n\s*href: "\/create\/post"\n\s*\},\n\s*\{\n\s*label: "Historia",\n\s*icon: Clock,\n\s*href: "\/create\/story"\n\s*\},\n\s*\{\n\s*label: "Nueva Receta",\n\s*icon: ChefHat,\n\s*href: "\/create\/recipe"\n\s*\}\n\s*\]/,
  `const options = [
    {
      label: "PublicaciÃ³n",
      icon: ImageIcon,
      href: "/create/post"
    },
    {
      label: "Historia",
      icon: Clock,
      href: "/create/story",
      isFilePicker: true
    },
    {
      label: "Texto (Historia)",
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

code = code.replace(
  /const handleNavigate = \(href: string\) => \{\n\s*setIsOpen\(false\)\n\s*router\.push\(href\)\n\s*\}/,
  `const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGlobalStoryDraft(file);
    setIsOpen(false);
    router.push("/create/story");
    e.target.value = "";
  }

  const handleNavigate = (option: any) => {
    if (option.isFilePicker) {
      fileInputRef.current?.click();
      return;
    }
    setIsOpen(false)
    router.push(option.href)
  }`
);

code = code.replace(
  /onClick=\{\(\) => handleNavigate\(option\.href\)\}/,
  `onClick={() => handleNavigate(option)}`
);

code = code.replace(
  /<div className="relative" ref=\{menuRef\}>/,
  `<div className="relative" ref={menuRef}>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />`
);

fs.writeFileSync('src/components/domain/GlobalCreateMenu.tsx', code);
console.log('Fixed GlobalCreateMenu.tsx');
