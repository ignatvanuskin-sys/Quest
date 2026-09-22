param(
  [Parameter(Mandatory=$true)][string]$Src,
  [Parameter(Mandatory=$true)][string]$Dst
)
# Extracts a frame from hero video as poster fallback (no ffmpeg, via WPF).
Add-Type -AssemblyName PresentationCore

$videoPath = (Get-ChildItem -File $Src -Filter '*.mp4' | Select-Object -First 1).FullName
$posterPath = Join-Path $Dst 'hero-poster.jpg'

$player = New-Object System.Windows.Media.MediaPlayer
$player.Open((New-Object System.Uri($videoPath)))
Start-Sleep -Milliseconds 3000
# перемотка в середину, чтобы получить содержательный кадр
if ($player.NaturalDuration.HasTimeSpan) {
  $mid = $player.NaturalDuration.TimeSpan.TotalMilliseconds / 2
  $player.Position = [TimeSpan]::FromMilliseconds([Math]::Min($mid, 4000))
}
$player.Play()
Start-Sleep -Milliseconds 1500
$player.Pause()
Start-Sleep -Milliseconds 500

$vw = $player.NaturalVideoWidth
$vh = $player.NaturalVideoHeight
Write-Output ("video: {0}x{1}" -f $vw, $vh)

if ($vw -gt 0 -and $vh -gt 0) {
  $rtb = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($vw, $vh, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
  $dv = New-Object System.Windows.Media.DrawingVisual
  $dc = $dv.RenderOpen()
  $dc.DrawVideo($player, (New-Object System.Windows.Rect(0, 0, $vw, $vh)))
  $dc.Close()
  $rtb.Render($dv)
  $enc = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
  $enc.QualityLevel = 82
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))
  $fs = [System.IO.File]::Create($posterPath)
  $enc.Save($fs)
  $fs.Close()
  $kb = [math]::Round((Get-Item $posterPath).Length / 1KB, 1)
  Write-Output ("hero-poster.jpg saved, {0} KB" -f $kb)
} else {
  Write-Output 'WARN: video did not decode, poster not created'
}
$player.Close()
