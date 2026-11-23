$files = Get-ChildItem -Path src\app\pages -Recurse -Filter *.component.ts
foreach ($f in $files) {
  $t = [IO.File]::ReadAllText($f.FullName)
  if ($t -notmatch 'subscribe' -or $t -match 'changeDetection') { continue }
  $t = $t -replace "import \{ Component,", "import { Component, ChangeDetectionStrategy,"
  $t = $t -replace "@Component\(\{", "@Component({`r`n  changeDetection: ChangeDetectionStrategy.Eager,"
  [IO.File]::WriteAllText($f.FullName, $t, (New-Object Text.UTF8Encoding($false)))
  Write-Host "Corrige : $($f.Name)"
}