$content = Get-Content "backend\.env"
foreach ($line in $content) {
    Write-Output $line
}
