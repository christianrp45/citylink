#!/usr/bin/env bash
# Renomeia "emetis"→"emetis", "Emetis"→"Emetis", "EMETIS"→"EMETIS"
# em todos os arquivos e pastas DENTRO do projeto.
# A pasta raiz (Emetis-main) NÃO é renomeada para não quebrar caminhos.
# Execute na raiz do projeto: bash rename-emetis.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Raiz: $ROOT"

# 1. Substituição de texto dentro dos arquivos
echo "==> Substituindo texto nos arquivos..."
find "$ROOT" \
  -type f \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \
     -o -name "*.json" -o -name "*.md" -o -name "*.env*" \
     -o -name "*.css" -o -name "*.sql" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/graphify-out/*" \
  ! -path "*/.git/*" \
  | while read -r file; do
    if grep -qE "emetis|Emetis|EMETIS|Emetis" "$file" 2>/dev/null; then
      sed -i \
        's/EMETIS/EMETIS/g; s/Emetis/Emetis/g; s/Emetis/Emetis/g; s/emetis/emetis/g' \
        "$file"
      echo "  [ok] $file"
    fi
  done

# 2. Renomear pastas — mais profundas primeiro, ignorar a pasta raiz do projeto
echo "==> Renomeando pastas..."
find "$ROOT" \
  -type d \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/.git/*" \
  | grep -iE "emetis" \
  | grep -v "^$ROOT$" \
  | sort -r \
  | while read -r dir; do
    parent="$(dirname "$dir")"
    oldname="$(basename "$dir")"
    newname="${oldname//EMETIS/EMETIS}"
    newname="${newname//Emetis/Emetis}"
    newname="${newname//Emetis/Emetis}"
    newname="${newname//emetis/emetis}"
    if [ "$oldname" != "$newname" ]; then
      mv "$dir" "$parent/$newname"
      echo "  [mv] $dir → $parent/$newname"
    fi
  done

# 3. Renomear arquivos com "emetis" no nome
echo "==> Renomeando arquivos..."
find "$ROOT" \
  -type f \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/.git/*" \
  | grep -iE "emetis" \
  | while read -r file; do
    dir="$(dirname "$file")"
    oldname="$(basename "$file")"
    newname="${oldname//EMETIS/EMETIS}"
    newname="${newname//Emetis/Emetis}"
    newname="${newname//Emetis/Emetis}"
    newname="${newname//emetis/emetis}"
    if [ "$oldname" != "$newname" ]; then
      mv "$file" "$dir/$newname"
      echo "  [mv] $file → $dir/$newname"
    fi
  done

echo ""
echo "==> Concluído!"
echo "==> Verificação (ocorrências restantes em .ts/.tsx):"
grep -r "emetis\|Emetis\|EMETIS" "$ROOT" \
  --include="*.ts" --include="*.tsx" \
  | grep -v node_modules | grep -v .next || echo "  Nenhuma ocorrência restante."
