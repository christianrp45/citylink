#!/usr/bin/env bash
# Renomeia "pib"→"mdc", "PIB"→"MDC", "Pib"→"Mdc" em todos os arquivos e pastas.
# Execute na raiz do projeto: bash rename-pib.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Raiz: $ROOT"

# 1. Substituição de texto em todos os arquivos relevantes
echo "==> Substituindo texto nos arquivos..."
find "$ROOT" \
  -type f \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \
     -o -name "*.json" -o -name "*.md" -o -name "*.env*" \
     -o -name "*.css" -o -name "*.sql" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/graphify-out/*" \
  ! -path "*/.git/*" \
  | while read -r file; do
    if grep -qE "pib|PIB|Pib" "$file" 2>/dev/null; then
      sed -i 's/PIB/MDC/g; s/Pib/Mdc/g; s/pib/mdc/g' "$file"
      echo "  [ok] $file"
    fi
  done

# 2. Renomear pastas (de mais profunda para mais rasa para não quebrar caminhos)
echo "==> Renomeando pastas..."
find "$ROOT" \
  -type d \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/.git/*" \
  | grep -E "(pib|PIB|Pib)" \
  | sort -r \
  | while read -r dir; do
    parent="$(dirname "$dir")"
    oldname="$(basename "$dir")"
    newname="${oldname//PIB/MDC}"
    newname="${newname//Pib/Mdc}"
    newname="${newname//pib/mdc}"
    if [ "$oldname" != "$newname" ]; then
      mv "$dir" "$parent/$newname"
      echo "  [mv] $dir → $parent/$newname"
    fi
  done

# 3. Renomear arquivos com "pib" no nome
echo "==> Renomeando arquivos..."
find "$ROOT" \
  -type f \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/.git/*" \
  | grep -E "(pib|PIB|Pib)" \
  | while read -r file; do
    dir="$(dirname "$file")"
    oldname="$(basename "$file")"
    newname="${oldname//PIB/MDC}"
    newname="${newname//Pib/Mdc}"
    newname="${newname//pib/mdc}"
    if [ "$oldname" != "$newname" ]; then
      mv "$file" "$dir/$newname"
      echo "  [mv] $file → $dir/$newname"
    fi
  done

echo ""
echo "==> Concluído!"
echo "==> Verificação:"
grep -r "pib\|PIB" "$ROOT" \
  --include="*.ts" --include="*.tsx" \
  | grep -v node_modules | grep -v .next || echo "  Nenhuma ocorrência restante."
