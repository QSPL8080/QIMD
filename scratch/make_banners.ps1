$w = 1200
$h = 480
$dir = "c:\Users\Admin\Downloads\QMID Website\QIMD\package\public\images\Banner"

if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir }

# Remove old banners cleanly
Get-ChildItem -Path $dir | Remove-Item -Force

Add-Type -AssemblyName System.Drawing

function Build-Banner($name, $badgeText, $title1, $title2, $sub, $bgHex1, $bgHex2, $accHex, $tagText) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $c1 = [System.Drawing.ColorTranslator]::FromHtml($bgHex1)
    $c2 = [System.Drawing.ColorTranslator]::FromHtml($bgHex2)
    $acc = [System.Drawing.ColorTranslator]::FromHtml($accHex)
    $dark = [System.Drawing.ColorTranslator]::FromHtml("#111827")
    $muted = [System.Drawing.ColorTranslator]::FromHtml("#374151")

    # Background gradient
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $lgb = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 35)
    $g.FillRectangle($lgb, $rect)

    # Decorative Circles Right
    $whiteAlpha = [System.Drawing.Color]::FromArgb(40, 255, 255, 255)
    $sbWhite = New-Object System.Drawing.SolidBrush($whiteAlpha)
    $g.FillEllipse($sbWhite, 720, -50, 480, 480)
    $g.FillEllipse($sbWhite, 800, 40, 320, 320)

    # Top Badge Box
    $badgeBg = [System.Drawing.Color]::FromArgb(35, $acc.R, $acc.G, $acc.B)
    $sbBadgeBg = New-Object System.Drawing.SolidBrush($badgeBg)
    $g.FillRectangle($sbBadgeBg, 65, 55, 190, 36)

    $fontBadge = New-Object System.Drawing.Font("Arial", 11, [System.Drawing.FontStyle]::Bold)
    $sbAcc = New-Object System.Drawing.SolidBrush($acc)
    $g.DrawString($badgeText, $fontBadge, $sbAcc, 80, 64)

    # Title 1 & 2
    $fontTitle = New-Object System.Drawing.Font("Arial", 36, [System.Drawing.FontStyle]::Bold)
    $sbDark = New-Object System.Drawing.SolidBrush($dark)
    $g.DrawString($title1, $fontTitle, $sbDark, 65, 115)
    $g.DrawString($title2, $fontTitle, $sbAcc, 65, 175)

    # Subtitle
    $fontSub = New-Object System.Drawing.Font("Arial", 15, [System.Drawing.FontStyle]::Regular)
    $sbMuted = New-Object System.Drawing.SolidBrush($muted)
    $g.DrawString($sub, $fontSub, $sbMuted, 65, 255)

    # Feature Pill Tag
    $tagBg = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
    $sbTagBg = New-Object System.Drawing.SolidBrush($tagBg)
    $g.FillRectangle($sbTagBg, 65, 345, 260, 46)

    $fontTag = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($tagText, $fontTag, $sbAcc, 85, 358)

    # Right side 3D Graphics Illustration (Podium, Target & Spheres)
    $shadowColor = [System.Drawing.Color]::FromArgb(40, 0, 0, 0)
    $sbShadow = New-Object System.Drawing.SolidBrush($shadowColor)
    $g.FillEllipse($sbShadow, 760, 370, 320, 40)

    # Podium Base
    $podiumColor = [System.Drawing.Color]::FromArgb(235, 243, 255)
    $sbPodium = New-Object System.Drawing.SolidBrush($podiumColor)
    $g.FillEllipse($sbPodium, 750, 300, 340, 95)

    # 3D Orbs / Floating Icons
    $g.FillEllipse($sbAcc, 730, 240, 45, 45)
    $g.FillEllipse($sbAcc, 1020, 100, 55, 55)

    # Main Target / Certificate 3D emblem
    $g.FillEllipse($sbAcc, 820, 160, 180, 180)
    $g.FillEllipse($sbTagBg, 855, 195, 110, 110)
    $g.FillEllipse($sbAcc, 880, 220, 60, 60)

    $filePath = Join-Path $dir $name
    $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created: $filePath"
}

Build-Banner "Banner 1.png" "CAREER BOOSTER" "Upgrade Your Skills." "Upgrade Your Future." "Master in-demand digital skills through live projects & practical training." "#eef2ff" "#dbeafe" "#2563eb" "v 100% Job Assistance"

Build-Banner "Banner 2.png" "ENROLL NOW" "Learn. Practice." "Get Hired." "Industry-focused training with real-world projects & placement assistance." "#f5f3ff" "#e9d5ff" "#7c3aed" "v Limited Seats Available"

Build-Banner "Banner 3.png" "AI PRACTICAL" "Master AI Tools." "Accelerate Career." "Learn ChatGPT, Midjourney & AI Workflows for Marketing & Design." "#f0fdf4" "#bbf7d0" "#16a34a" "v 100% Practical Projects"

Build-Banner "Banner 4.png" "SCHOLARSHIP" "Transform Skills." "Build Portfolio." "Work on live client projects with dedicated industry expert mentors." "#fffbeb" "#fef08a" "#d97706" "v Certified Programs"
