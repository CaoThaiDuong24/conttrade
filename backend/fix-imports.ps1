# Fix all .ts imports to add .js extension for ES modules

$files = Get-ChildItem -Path "src" -Include "*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix prisma imports
    $content = $content -replace "from '\.\./lib/prisma'", "from '../lib/prisma.js'"
    $content = $content -replace "from '\./lib/prisma'", "from './lib/prisma.js'"
    
    # Fix route imports
    $content = $content -replace "from '\./routes/([^']+)'", "from './routes/`$1.js'"
    $content = $content -replace "from '\./services/([^']+)'", "from './services/`$1.js'"
    
    # Write back
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "Fixed: $($file.FullName)"
}

Write-Host "`nDone! All imports fixed."
