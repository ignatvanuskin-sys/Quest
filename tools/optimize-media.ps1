param(
  [Parameter(Mandatory=$true)][string]$Src,
  [Parameter(Mandatory=$true)][string]$Dst
)
# NOX — разовая оптимизация медиа. Пути передаются аргументами (кириллица-safe).
Add-Type -AssemblyName System.Drawing

New-Item -ItemType Directory -Force (Join-Path $Dst 'quests') | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality, [long]82)

function Save-Crop($srcName, $dstRel, $tw, $th, $fx = 0.5, $fy = 0.5) {
  $srcPath = Join-Path $Src $srcName
  $dstPath = Join-Path $Dst $dstRel
  $img = [System.Drawing.Image]::FromFile($srcPath)
  $sw = $img.Width; $sh = $img.Height
  $srcRatio = $sw / $sh; $dstRatio = $tw / $th
  if ($srcRatio -gt $dstRatio) {
    $cw = [int]($sh * $dstRatio); $ch = $sh
  } else {
    $cw = $sw; $ch = [int]($sw / $dstRatio)
  }
  $cx = [int](($sw - $cw) * $fx); $cy = [int](($sh - $ch) * $fy)
  $bmp = New-Object System.Drawing.Bitmap($tw, $th)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $tw, $th)),
    (New-Object System.Drawing.Rectangle($cx, $cy, $cw, $ch)),
    [System.Drawing.GraphicsUnit]::Pixel)
  $bmp.Save($dstPath, $jpegCodec, $encParams)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  $kb = [math]::Round((Get-Item $dstPath).Length / 1KB, 1)
  Write-Output ("{0}  {1}x{2}  {3} KB" -f $dstRel, $tw, $th, $kb)
}

$candleName = (Get-ChildItem -File $Src -Filter 'Candle*').Name
$doorName   = (Get-ChildItem -File $Src -Filter '*.jpeg' | Where-Object { $_.Name -match '^\u0414' }).Name
$keyName    = (Get-ChildItem -File $Src -Filter '*.jpeg' | Where-Object { $_.Name -match '^\u0421' }).Name

# --- Обложки квестов 4:5 (900x1125) ---
Save-Crop 'Raven_sits_on_armchair_20260918174936.jpeg'             'quests\dom-vorona.jpg'           900 1125 0.5 0.55
Save-Crop 'Abandoned_hospital_bed_under_light_20260918174941.jpeg' 'quests\klinika-9.jpg'            900 1125 0.5 0.55
Save-Crop 'Doll_parts_on_wooden_workbench_20260918174943.jpeg'     'quests\kukolnyh-del-master.jpg'  900 1125 0.5 0.5
Save-Crop 'Warm_light_in_abandoned_building_20260918174945.jpeg'   'quests\cherny-korabl.jpg'        900 1125 0.5 0.45

# --- Галерея 16:10 (1280x800) ---
Save-Crop 'Abandoned_corridor_with_fog_and_20260918174955.jpeg'    'quests\g-corridor.jpg' 1280 800 0.5 0.45
Save-Crop 'Antique_wooden_chair_in_room_20260918174930.jpeg'       'quests\g-chair.jpg'    1280 800 0.5 0.55
Save-Crop $doorName                                                'quests\g-door.jpg'     1280 800 0.55 0.5
Save-Crop $keyName                                                 'quests\g-key.jpg'      1280 800 0.5 0.5

# --- Свеча для экрана подтверждения (768x768) ---
Save-Crop $candleName                                              'candle.jpg' 768 768 0.5 0.55

# --- Фоны секций ---
Save-Crop 'Abandoned_corridor_with_fog_and_20260918174955.jpeg'    'bg-about.jpg'    1280 1280 0.5 0.45
Save-Crop $doorName                                                'bg-steps.jpg'    1280 1024 0.55 0.5
Save-Crop 'Antique_wooden_chair_in_room_20260918174930.jpeg'       'bg-booking.jpg'  1280 1280 0.5 0.55

# --- OG preview 1200x630 из ворона ---
Save-Crop 'Raven_sits_on_armchair_20260918174936.jpeg'             'og-image.jpg' 1200 630 0.5 0.42
