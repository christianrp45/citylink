#!/usr/bin/env bash
# Renomeia "Teos"→"Teo" e "teos"→"teo" em todos os arquivos e pastas do projeto.
# Execute na raiz do projeto: bash rename-teos.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Raiz: $ROOT"

# 1. Substituição de texto em todos os arquivos relevantes
echo "==> Substituindo texto nos arquivos..."
find "$ROOT" \
  -type f \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.env*" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/graphify-out/*" \
  ! -path "*/.git/*" \
  | while read -r file; do
    # Substitui Teos→Teo e teos→teo (case-sensitive, ambos)
    if grep -qE "Teos|teos" "$file" 2>/dev/null; then
      sed -i 's/Teos/Teo/g; s/teos/teo/g' "$file"
      echo "  [ok] $file"
    fi
  done

# 2. Renomear pastas que contenham "teos" no nome
echo "==> Renomeando pastas..."
find "$ROOT" \
  -type d \
  -name "*teos*" \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/.git/*" \
  | sort -r \
  | while read -r dir; do
    parent="$(dirname "$dir")"
    oldname="$(basename "$dir")"
    newname="${oldname//teos/teo}"
    newname="${newname//Teos/Teo}"
    if [ "$oldname" != "$newname" ]; then
      mv "$dir" "$parent/$newname"
      echo "  [mv] $dir → $parent/$newname"
    fi
  done

# 3. Renomear arquivos que contenham "teos" no nome
echo "==> Renomeando arquivos..."
find "$ROOT" \
  -type f \
  -name "*teos*" \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/.git/*" \
  | while read -r file; do
    dir="$(dirname "$file")"
    oldname="$(basename "$file")"
    newname="${oldname//teos/teo}"
    newname="${newname//Teos/Teo}"
    if [ "$oldname" != "$newname" ]; then
      mv "$file" "$dir/$newname"
      echo "  [mv] $file → $dir/$newname"
    fi
  done

echo ""
echo "==> Concluído. Verifique com: grep -r 'teos\|Teos' --include='*.ts' --include='*.tsx' . | grep -v node_modules"
