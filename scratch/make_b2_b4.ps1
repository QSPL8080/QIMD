Add-Type -AssemblyName System.Drawing
$w = 1200
$h = 480
$dir = "c:\Users\Admin\Downloads\QMID Website\QIMD\package\public\images\Banner"

function Build-Single-Banner($name, $badgeText, $title1, $title2, $sub, $bgHex1, $bgHex2, $accHex, $tagText) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $c1 = [System.Drawing.ColorTranslator]::FromHtml($bgHex1)
    $c2 = [System.Drawing.ColorTranslator]::FromHtml($bgHex2)
    $acc = [System.Drawing.ColorTranslator]::FromHtml($accHex)
    $dark = [System.Drawing.ColorTranslator]::FromHtml("#0f172a")

    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $lgb = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 40)
    $g.FillRectangle($lgb, $rect)

    $whiteGlow = [System.Drawing.Color]::FromArgb(45, 255, 255, 255)
    $sbGlow = New-Object System.Drawing.SolidBrush($whiteGlow)
    $g.FillEllipse($sbGlow, 650, -80, 600, 600)

    $accGlow = [System.Drawing.Color]::FromArgb(35, $acc.R, $acc.G, $acc.B)
    $sbAccGlow = New-Object System.Drawing.SolidBrush($accGlow)
    $g.FillEllipse($sbAccGlow, 700, 60, 450, 450)

    $badgeBg = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
    $sbBadgeBg = New-Object System.Drawing.SolidBrush($badgeBg)
    $g.FillRectangle($sbBadgeBg, 60, 50, 210, 38)

    $fontBadge = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $sbAcc = New-Object System.Drawing.SolidBrush($acc)
    $g.DrawString("⚡ " + $badgeText, $fontBadge, $sbAcc, 75, 59)

    $fontTitle = New-Object System.Drawing.Font("Segoe UI", 36, [System.Drawing.FontStyle]::Bold)
    $sbDark = New-Object System.Drawing.SolidBrush($dark)
    $g.DrawString($title1, $fontTitle, $sbDark, 60, 110)
    $g.DrawString($title2, $fontTitle, $sbAcc, 60, 170)

    $fontSub = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold)
    $sbMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 30, 41, 59))
    $g.DrawString($sub, $fontSub, $sbMuted, 60, 250)

    $tagBg = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
    $sbTagBg = New-Object System.Drawing.SolidBrush($tagBg)
    $g.FillRectangle($sbTagBg, 60, 345, 290, 48)

    $fontTag = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($tagText, $fontTag, $sbAcc, 80, 358)

    $shadowColor = [System.Drawing.Color]::FromArgb(50, 15, 23, 42)
    $sbShadow = New-Object System.Drawing.SolidBrush($shadowColor)
    $g.FillEllipse($sbShadow, 760, 375, 340, 45)

    $glassBase = [System.Drawing.Color]::FromArgb(220, 255, 255, 255)
    $sbGlassBase = New-Object System.Drawing.SolidBrush($glassBase)
    $g.FillEllipse($sbGlassBase, 740, 305, 360, 100)

    $g.FillEllipse($sbAcc, 715, 230, 50, 50)
    $g.FillEllipse($sbAcc, 1030, 95, 60, 60)
    $g.FillEllipse($sbBadgeBg, 745, 120, 35, 35)

    $g.FillEllipse($sbAcc, 815, 150, 200, 200)
    $g.FillEllipse($sbBadgeBg, 850, 185, 130, 130)
    $g.FillEllipse($sbAcc, 880, 215, 70, 70)
    $g.FillEllipse($sbBadgeBg, 900, 235, 30, 30)

    $filePath = Join-Path $dir $name
    $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $filePath"
}

Build-Single-Banner "Banner 2.png" "ENROLL NOW" "Learn. Practice." "Get Hired." "Industry-focused training with real-world project portfolios." "#e0f2fe" "#bae6fd" "#0284c7" "v Limited Seats Available"
Build-Single-Banner "Banner 4.png" "SCHOLARSHIP" "Transform Skills." "Build Portfolio." "Work on live client projects with dedicated industry expert mentors." "#ffedd5" "#fde68a" "#ea580c" "v Certified Programs"
