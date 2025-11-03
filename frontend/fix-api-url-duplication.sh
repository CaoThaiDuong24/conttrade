#!/bin/bash

# This script fixes the API_URL duplication issue where files have:
# const API_URL = '/api/v1' but use ${API_URL}/api/v1/... 
# creating paths like /api/v1/api/v1/...

echo "Fixing API_URL duplication in frontend files..."

# Find and replace pattern: ${API_URL}/api/v1/ -> ${API_URL}/
# Only in files that have const API_URL = '/api/v1'

FILES=(
  "app/favorites/page.tsx"
  "app/[locale]/messages/page.tsx"
  "app/[locale]/messages/[id]/page.tsx"
  "app/[locale]/orders/create/page.tsx"
  "app/[locale]/orders/[id]/pay/page.tsx"
  "app/[locale]/delivery/page.tsx"
  "app/[locale]/delivery/track/[id]/page.tsx"
  "app/[locale]/rfq/sent/page.tsx"
  "app/[locale]/rfq/create/page.tsx"
  "app/listings/page.tsx"
  "app/listings/[id]/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    # Replace ${API_URL}/api/v1/ with ${API_URL}/
    sed -i 's|\${API_URL}/api/v1/|${API_URL}/|g' "$file"
    # Replace `${API_URL}/api/v1/ with `${API_URL}/
    sed -i 's|`\${API_URL}/api/v1/|`${API_URL}/|g' "$file"
  else
    echo "File not found: $file"
  fi
done

echo "Done! Fixed API_URL duplication in ${#FILES[@]} files."
