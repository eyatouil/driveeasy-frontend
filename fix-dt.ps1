$files = Get-ChildItem -Path src\app -Recurse -Filter *.html
foreach ($f in $files) {
  $t = [IO.File]::ReadAllText($f.FullName)
  if ($t.Contains([string][char]0x20AC)) {
    $t = $t.Replace([string][char]0x20AC, "DT")
    [IO.File]::WriteAllText($f.FullName, $t, (New-Object Text.UTF8Encoding($false)))
    Write-Host "Corrige : $($f.Name)"
  }
}