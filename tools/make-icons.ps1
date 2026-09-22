param(
  [Parameter(Mandatory=$true)][string]$Media,
  [Parameter(Mandatory=$true)][string]$AppDir
)
# Generate favicon PNG (48) + apple-touch-icon (180) from the candle photo.
Add-Type -AssemblyName System.Drawing

$src = Get-ChildItem -File $Media -Filter 'Candle*' | Select-Object -First 1
$img = [System.Drawing.Image]::FromFile($src.FullName)

function Resize-Save($size, $dstPath) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($img, 0, 0, $size, $size)
  $bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  Write-Output ("{0} {1}x{1}" -f (Split-Path $dstPath -Leaf), $size)
}

Resize-Save 48  (Join-Path $AppDir 'icon.png')
Resize-Save 180 (Join-Path $AppDir 'apple-icon.png')
$img.Dispose()
