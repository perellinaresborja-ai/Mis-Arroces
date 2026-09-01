import os
import re

files = [
    'src/app/recipes/[id]/page.tsx',
    'src/components/domain/InteractiveRecipeView.tsx',
    'src/components/domain/cook-mode/CookModeClient.tsx',
    'src/components/domain/NutritionSection.tsx'
]

replacements = {
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
}

for filepath in files:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    for bad, good in replacements.items():
        content = content.replace(bad, good)
        
    if content != orig:
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        print(f"Fixed {filepath}")
