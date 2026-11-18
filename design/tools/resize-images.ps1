# Convert generated PNGs into web JPEGs for the demo.
#   powershell -ExecutionPolicy Bypass -File design/tools/resize-images.ps1            # every PNG in design/images/new
#   powershell -ExecutionPolicy Bypass -File design/tools/resize-images.ps1 hero kyc   # only these
# Reads design/images/new/<name>.png, writes demo/img/<name>.jpg (1600px wide, JPEG quality 78).
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Names)

Add-Type -AssemblyName System.Drawing
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$raw = Join-Path $root 'design\images\new'
$out = Join-Path $root 'demo\img'
New-Item -ItemType Directory -Force $out | Out-Null

$files = if ($Names) { $Names | ForEach-Object { Get-Item (Join-Path $raw "$_.png") } } else { Get-ChildItem (Join-Path $raw '*.png') }
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

foreach ($f in $files) {
  $src = [System.Drawing.Image]::FromFile($f.FullName)
  $w = 1600; $q = 78
  $h = [int]($src.Height * $w / $src.Width)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($src, 0, 0, $w, $h)
  $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$q)
  $dst = Join-Path $out "$($f.BaseName).jpg"
  $bmp.Save($dst, $codec, $ep)
  $g.Dispose(); $bmp.Dispose(); $src.Dispose()
  "wrote demo/img/$($f.BaseName).jpg ($([int]((Get-Item $dst).Length / 1KB)) KB)"
}
