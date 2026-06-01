Add-Type -AssemblyName System.Drawing

function New-PowerIcon {
    param(
        [string]$Path,
        [System.Drawing.Color]$Color
    )

    $sizes = @(16, 32, 48)
    $bitmaps = @()
    foreach ($size in $sizes) {
        $bmp = New-Object System.Drawing.Bitmap($size, $size)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.Clear([System.Drawing.Color]::Transparent)

        # Outer circle background
        $bgBrush = New-Object System.Drawing.SolidBrush $Color
        $g.FillEllipse($bgBrush, 1, 1, $size - 2, $size - 2)

        # Power symbol (vertical line + arc gap at top)
        $penWidth = [Math]::Max(1, [int]($size / 8))
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, $penWidth)
        $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

        $cx = $size / 2
        $arcSize = $size * 0.5
        $arcX = $cx - $arcSize / 2
        $arcY = $size * 0.3
        $g.DrawArc($pen, $arcX, $arcY, $arcSize, $arcSize, 40, 260)

        $g.DrawLine($pen, $cx, $size * 0.2, $cx, $size * 0.55)

        $g.Dispose()
        $bitmaps += $bmp
    }

    # Write ICO file manually (Windows supports multi-size ICO with PNG-compressed entries for 256)
    $ms = New-Object System.IO.MemoryStream
    $writer = New-Object System.IO.BinaryWriter($ms)

    # ICONDIR
    $writer.Write([UInt16]0)          # reserved
    $writer.Write([UInt16]1)          # type 1 = icon
    $writer.Write([UInt16]$bitmaps.Count)

    $imageDataList = @()
    foreach ($bmp in $bitmaps) {
        $imgMs = New-Object System.IO.MemoryStream
        $bmp.Save($imgMs, [System.Drawing.Imaging.ImageFormat]::Png)
        $imageDataList += ,$imgMs.ToArray()
    }

    # ICONDIRENTRY offset starts after 6-byte header + 16-byte entries
    $offset = 6 + (16 * $bitmaps.Count)
    for ($i = 0; $i -lt $bitmaps.Count; $i++) {
        $bmp = $bitmaps[$i]
        $imgBytes = $imageDataList[$i]
        $w = if ($bmp.Width -ge 256) { 0 } else { $bmp.Width }
        $h = if ($bmp.Height -ge 256) { 0 } else { $bmp.Height }

        $writer.Write([Byte]$w)        # width
        $writer.Write([Byte]$h)        # height
        $writer.Write([Byte]0)         # colors
        $writer.Write([Byte]0)         # reserved
        $writer.Write([UInt16]1)       # color planes
        $writer.Write([UInt16]32)      # bits per pixel
        $writer.Write([UInt32]$imgBytes.Length)
        $writer.Write([UInt32]$offset)

        $offset += $imgBytes.Length
    }

    foreach ($imgBytes in $imageDataList) {
        $writer.Write($imgBytes)
    }

    [System.IO.File]::WriteAllBytes($Path, $ms.ToArray())
    $writer.Dispose()
    foreach ($bmp in $bitmaps) { $bmp.Dispose() }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
New-PowerIcon -Path (Join-Path $scriptDir 'icon-connected.ico')    -Color ([System.Drawing.Color]::FromArgb(34, 197, 94))   # green-500
New-PowerIcon -Path (Join-Path $scriptDir 'icon-disconnected.ico') -Color ([System.Drawing.Color]::FromArgb(107, 114, 128)) # gray-500

Write-Output "Icons created:"
Get-ChildItem (Join-Path $scriptDir '*.ico') | Select Name, Length
