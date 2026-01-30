# 📤 تعليمات رفع المشروع على GitHub

## ✅ تم إعداد Git محلياً!

تم تنفيذ الخطوات التالية:
- ✅ إنشاء مستودع Git محلي
- ✅ إضافة جميع الملفات
- ✅ عمل Commit أولي

---

## 🚀 الخطوات المتبقية (يدوياً):

### 1️⃣ إنشاء مستودع على GitHub

1. اذهب إلى [GitHub](https://github.com)
2. سجل دخول (أو أنشئ حساب جديد)
3. اضغط على زر **"New"** أو **"+"** → **"New repository"**
4. املأ المعلومات:
   ```
   Repository name: edu-platform
   Description: منصة تعليمية متطورة لإدارة الكورسات الدراسية
   Public ✓ (أو Private حسب رغبتك)
   ❌ لا تضف README أو .gitignore أو LICENSE (موجودين بالفعل)
   ```
5. اضغط **"Create repository"**

---

### 2️⃣ ربط المستودع المحلي بـ GitHub

بعد إنشاء المستودع، ستظهر لك تعليمات. استخدم هذه الأوامر:

```bash
# افتح Terminal/PowerShell في مجلد المشروع
cd "d:/كورساتي"

# أضف رابط المستودع (استبدل YOUR_USERNAME باسم حسابك)
git remote add origin https://github.com/YOUR_USERNAME/edu-platform.git

# أو إذا كنت تستخدم SSH:
# git remote add origin git@github.com:YOUR_USERNAME/edu-platform.git

# ارفع المشروع
git branch -M main
git push -u origin main
```

---

### 3️⃣ تفعيل GitHub Pages (اختياري)

لنشر الموقع مجاناً على GitHub Pages:

1. اذهب لمستودعك على GitHub
2. اضغط **Settings** (الإعدادات)
3. من القائمة الجانبية، اختر **Pages**
4. في قسم **Source**:
   - Branch: اختر `main`
   - Folder: اختر `/ (root)`
5. اضغط **Save**
6. انتظر دقيقة، ثم ستجد رابط الموقع:
   ```
   https://YOUR_USERNAME.github.io/edu-platform/
   ```

---

## 🔄 تحديث المشروع لاحقاً

عند إجراء تعديلات جديدة:

```bash
# أضف التغييرات
git add .

# اعمل Commit
git commit -m "وصف التحديث"

# ارفع على GitHub
git push
```

---

## 📝 أوامر Git مفيدة

```bash
# معرفة حالة الملفات
git status

# رؤية السجل
git log --oneline

# إنشاء فرع جديد
git checkout -b feature-name

# التبديل بين الفروع
git checkout main

# دمج فرع
git merge feature-name
```

---

## 🌐 بدائل GitHub Pages

### Netlify (سهل جداً):
1. اذهب إلى [netlify.com](https://netlify.com)
2. سجل دخول بحساب GitHub
3. اضغط **"Add new site"** → **"Import an existing project"**
4. اختر المستودع
5. اضغط **Deploy**
6. سيعطيك رابط مثل: `your-site.netlify.app`

### Vercel:
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول بحساب GitHub
3. اضغط **"Add New Project"**
4. اختر المستودع
5. اضغط **Deploy**

---

## ❓ حل المشاكل

### المشكلة: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/edu-platform.git
```

### المشكلة: "Permission denied"
- تأكد من تسجيل الدخول في GitHub
- أو استخدم Personal Access Token بدلاً من كلمة المرور

### المشكلة: "failed to push"
```bash
git pull origin main --rebase
git push origin main
```

---

## 📞 المساعدة

- [توثيق GitHub](https://docs.github.com)
- [دليل Git](https://git-scm.com/doc)
- [GitHub Pages](https://pages.github.com)

---

## ✅ الخلاصة

**ما تم:**
- ✅ إعداد Git محلياً
- ✅ عمل Commit للمشروع

**ما يجب فعله:**
1. إنشاء مستودع على GitHub
2. ربط المستودع المحلي بـ GitHub
3. رفع المشروع (`git push`)
4. (اختياري) تفعيل GitHub Pages

---

**بالتوفيق! 🚀**
