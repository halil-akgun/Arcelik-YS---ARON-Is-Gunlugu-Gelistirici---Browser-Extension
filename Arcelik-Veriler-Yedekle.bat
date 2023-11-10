@echo off
setlocal enabledelayedexpansion

REM Yedeklenecek dosya adı
set "dosya_adi=Hesap Verileri.json"

REM Yedeklenecek dosya yolu
set "kaynak_dosya=%HOMEPATH%\Documents\%dosya_adi%"

REM Hedef yedek klasörü (D: sürücüsü varsa D:, yoksa C:)
if exist D: (
    set "hedef_klasor=D:\yedek"
) else (
    set "hedef_klasor=C:\yedek"
)

REM Tarih ve saat bilgisini al
for /f "delims=" %%a in ('wmic OS Get localdatetime ^| find "."') do set "tarih=%%a"
set "tarih=!tarih:~0,4!!tarih:~4,2!!tarih:~6,2!_!tarih:~8,2!!tarih:~10,2!"

REM Yedek klasörünü yoksa oluştur
if not exist "%hedef_klasor%" (
    mkdir "%hedef_klasor%"
)

REM Yedek dosya yolu ve adı
set "yedek_dosya=%hedef_klasor%\%dosya_adi%"

REM Eğer yedek dosya varsa kontrol et
if exist "%yedek_dosya%" (
    set "kaynak_boyut=0"
    set "yedek_boyut=0"

    if exist "%kaynak_dosya%" (
	if exist "%kaynak_dosya%" (
	    for %%F in ("%kaynak_dosya%") do set "kaynak_boyut=%%~zF"
	)
	if exist "%yedek_dosya%" (
	    for %%F in ("%yedek_dosya%") do set "yedek_boyut=%%~zF"
	)

        REM Eğer yedek dosyanın boyutu daha büyükse
        if !kaynak_boyut! lss !yedek_boyut! (
            echo Eksik veriler tespit edildi. Yedek dosya adı güncelleniyor...
            REM Eski dosyaya tarih ekle
            ren "!yedek_dosya!" "%dosya_adi%_!tarih!.json"
        )
    )

    REM Yeni dosyayı kaydet
    copy /y "%kaynak_dosya%" "!yedek_dosya!"
    echo Yedekleme tamamlandı.
) else (
    REM Yedek dosya yoksa, yeni dosyayı kaydet
    copy /y "%kaynak_dosya%" "!yedek_dosya!"
    echo Yedekleme tamamlandı.
)

exit