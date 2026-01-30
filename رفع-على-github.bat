@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     📤 رفع المشروع على GitHub                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo ⚠️  تأكد من إنشاء مستودع على GitHub أولاً!
echo.
echo 📝 الخطوات:
echo    1. اذهب إلى github.com
echo    2. أنشئ مستودع جديد (New Repository)
echo    3. لا تضف README أو .gitignore
echo    4. انسخ رابط المستودع
echo.
echo ════════════════════════════════════════════════════════
echo.

set /p username="أدخل اسم المستخدم على GitHub: "
set /p reponame="أدخل اسم المستودع (مثال: edu-platform): "

echo.
echo 🔄 جاري الربط والرفع...
echo.

git remote add origin https://github.com/%username%/%reponame%.git
git branch -M main
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ✅ تم رفع المشروع بنجاح!
    echo.
    echo 🌐 رابط المستودع:
    echo    https://github.com/%username%/%reponame%
    echo.
    echo 📄 لتفعيل GitHub Pages:
    echo    1. اذهب للمستودع
    echo    2. Settings ^> Pages
    echo    3. Source: main branch
    echo    4. Save
    echo.
    echo 🎉 الموقع سيكون متاح على:
    echo    https://%username%.github.io/%reponame%/
) else (
    echo ❌ حدث خطأ!
    echo.
    echo 💡 الحلول الممكنة:
    echo    - تأكد من إنشاء المستودع على GitHub
    echo    - تأكد من تسجيل الدخول في Git
    echo    - إذا كان المستودع موجود، استخدم:
    echo      git remote remove origin
    echo      ثم أعد تشغيل هذا الملف
)

echo.
pause
