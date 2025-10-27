# Fix ALL TypeScript imports to add .js extension for ES modules

$files = Get-ChildItem -Path "src" -Include "*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix all relative imports that don't already have .js
    # Match: from './something' or from '../something' but NOT from './something.js'
    $content = $content -replace "from\s+(['""])(\.\./[^'""]*)(?<!\.js)(?<!\.mjs)(?<!\.cjs)\1", "from `$1`$2.js`$1"
    $content = $content -replace "from\s+(['""])(\.\/[^'""]*)(?<!\.js)(?<!\.mjs)(?<!\.cjs)\1", "from `$1`$2.js`$1"
    
    # Only write if changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nDone! All imports fixed."
