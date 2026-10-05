import os
import re

replacements = {
    "Ã³": "ó",
    "Ã¡": "á",
    "Ã©": "é",
    "Ã­": "í",
    "Ãº": "ú",
    "Ã±": "ñ",
    "Ã“": "Ó",
    "Â·": "·",
    "Â¡": "¡",
    "Â¿": "¿",
    "RAÃ Z": "RAÍZ",
    "RaÃz": "Raíz",
    "aÃºn": "aún",
    "DespuÃ©s": "Después",
    "AcciÃ³n": "Acción",
    "ejecuciÃ³n": "ejecución",
    "DesviaciÃ³n": "Desviación",
    "TÃ©cnica": "Técnica",
    "ValidaciÃ³n": "Validación",
    "HipÃ³tesis": "Hipótesis",
    "EstadÃstica": "Estadística",
    "ConclusiÃ³n": "Conclusión",
    "EVALUACIÃ“N": "EVALUACIÓN",
    "Causa RaÃ­z": "Causa Raíz",
    "EstadÃ­stica": "Estadística"
}

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        for bad, good in replacements.items():
            content = content.replace(bad, good)
            
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {filepath}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

def main():
    src_dir = os.path.join(os.getcwd(), 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                fix_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
