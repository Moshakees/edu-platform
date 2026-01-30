// Admin View
window.AdminView = function () {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;
    const formatDate = window.Utils.formatDate;

    const session = window.store.checkSession();
    if (!session || session.role !== 'admin') {
        window.location.hash = '#login';
        return elt('div');
    }

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px; padding-bottom: 60px;' });

    const header = elt('header', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;' },
        elt('h1', {}, 'لوحة التحكم'),
        elt('button', { className: 'btn btn-outline', onclick: () => window.store.logout() }, 'تسجيل الخروج')
    );

    const tabs = elt('div', { style: 'display: flex; gap: 20px; margin-bottom: 30px; border-bottom: 1px solid var(--surface-border); padding-bottom: 10px;' });
    const tabCodes = elt('button', { className: 'btn btn-primary' }, 'الأكواد والمستخدمين');
    const tabContent = elt('button', { className: 'btn btn-outline' }, 'إدارة المحتوى');

    tabs.append(tabCodes, tabContent);

    const contentArea = elt('div', { id: 'admin-content' });

    const switchTab = (activeBtn) => {
        [tabCodes, tabContent].forEach(b => {
            b.className = 'btn btn-outline';
            b.style.borderBottom = 'none';
        });
        activeBtn.className = 'btn btn-primary';
        contentArea.innerHTML = '';
    };

    tabCodes.onclick = () => {
        switchTab(tabCodes);
        renderCodesTab(contentArea);
    };

    tabContent.onclick = () => {
        switchTab(tabContent);
        renderContentTab(contentArea);
    };

    tabCodes.click();

    container.append(header, tabs, contentArea);
    return container;
};

function renderCodesTab(container) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;
    const formatDate = window.Utils.formatDate;

    // نموذج إنشاء كود جديد
    const form = elt('div', { className: 'glass-panel', style: 'padding: 20px; margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;' });

    const nameInput = elt('div', { style: 'flex: 1; min-width: 200px;' },
        elt('label', { style: 'display: block; margin-bottom: 5px;' }, 'اسم الطالب'),
        elt('input', { type: 'text', placeholder: 'مثال: أحمد محمد' })
    );

    const daysInput = elt('div', { style: 'width: 150px;' },
        elt('label', { style: 'display: block; margin-bottom: 5px;' }, 'المدة (أيام)'),
        elt('input', { type: 'number', value: '30' })
    );

    const genBtn = elt('button', { className: 'btn btn-primary', style: 'height: 48px;' }, 'توليد كود جديد');

    genBtn.onclick = () => {
        const name = nameInput.lastChild.value;
        const days = daysInput.lastChild.value;
        if (!name || !days) return showNotification('جميع الحقول مطلوبة', 'error');

        const code = window.store.generateCode(name, days);
        showNotification(`تم إنشاء الكود بنجاح: ${code.code}`);
        nameInput.lastChild.value = '';
        refreshList();
    };

    form.append(nameInput, daysInput, genBtn);

    // خانة البحث
    const searchPanel = elt('div', { className: 'glass-panel', style: 'padding: 15px; margin-bottom: 20px; display: flex; gap: 10px; align-items: center;' });

    const searchIcon = elt('ion-icon', { name: 'search-outline', style: 'font-size: 1.5rem; color: var(--primary-color);' });

    const searchInput = elt('input', {
        type: 'text',
        placeholder: 'ابحث عن مستخدم بالكود أو الاسم...',
        style: 'flex: 1; direction: ltr;'
    });

    searchInput.oninput = () => refreshList(searchInput.value);

    searchPanel.append(searchIcon, searchInput);

    // جدول الأكواد
    const tableContainer = elt('div', { className: 'glass-panel', style: 'overflow-x: auto;' });
    const table = elt('table', { style: 'width: 100%; border-collapse: collapse; min-width: 700px;' });

    const thead = elt('thead', {},
        elt('tr', { style: 'background: rgba(255,255,255,0.05); text-align: right;' },
            elt('th', { style: 'padding: 15px;' }, 'الكود'),
            elt('th', { style: 'padding: 15px;' }, 'الاسم'),
            elt('th', { style: 'padding: 15px;' }, 'الحالة'),
            elt('th', { style: 'padding: 15px;' }, 'تاريخ التفعيل'),
            elt('th', { style: 'padding: 15px;' }, 'تاريخ الانتهاء'),
            elt('th', { style: 'padding: 15px; min-width: 200px;' }, 'إجراءات')
        )
    );

    const tbody = elt('tbody');

    const refreshList = (searchTerm = '') => {
        tbody.innerHTML = '';
        let codes = window.store.getCodes().reverse();

        // تطبيق البحث
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            codes = codes.filter(c =>
                c.code.toLowerCase().includes(term) ||
                c.name.toLowerCase().includes(term)
            );
        }

        if (codes.length === 0) {
            const emptyRow = elt('tr', {},
                elt('td', { colspan: '6', style: 'padding: 40px; text-align: center; color: var(--text-muted);' },
                    searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد أكواد مُنشأة بعد'
                )
            );
            tbody.append(emptyRow);
            return;
        }

        codes.forEach(c => {
            const tr = elt('tr', { style: 'border-bottom: 1px solid var(--surface-border);' });

            let statusColor = '#94a3b8';
            if (c.status === 'active') statusColor = '#10b981';
            if (c.status === 'expired') statusColor = '#f59e0b';
            if (c.status === 'banned') statusColor = '#ef4444';

            // زر الحظر/فك الحظر
            const banBtn = elt('button', {
                className: 'btn btn-outline',
                style: 'padding: 5px 10px; font-size: 0.8rem; margin-left: 5px;'
            }, c.status === 'banned' ? 'فك الحظر' : 'حظر');

            banBtn.onclick = () => {
                window.store.updateCodeStatus(c.code, c.status === 'banned' ? (c.activationDate ? 'active' : 'new') : 'banned');
                showNotification(c.status === 'banned' ? 'تم فك الحظر' : 'تم حظر الكود');
                refreshList(searchInput.value);
            };

            // زر التجديد
            const renewBtn = elt('button', {
                className: 'btn btn-primary',
                style: 'padding: 5px 10px; font-size: 0.8rem;'
            }, 'تجديد');

            renewBtn.onclick = () => {
                const days = prompt('كم يوم تريد إضافتها؟', '30');
                if (days && !isNaN(days) && parseInt(days) > 0) {
                    const success = window.store.renewCode(c.code, parseInt(days));
                    if (success) {
                        showNotification(`تم تجديد الكود بنجاح! تمت إضافة ${days} يوم`);
                        refreshList(searchInput.value);
                    } else {
                        showNotification('فشل التجديد', 'error');
                    }
                }
            };

            const actionsCell = elt('td', { style: 'padding: 15px; display: flex; gap: 5px; flex-wrap: wrap;' });
            actionsCell.append(renewBtn, banBtn);

            tr.append(
                elt('td', { style: 'padding: 15px; font-weight: bold; font-family: monospace; direction: ltr;' }, c.code),
                elt('td', { style: 'padding: 15px;' }, c.name),
                elt('td', { style: 'padding: 15px; color: ' + statusColor }, translateStatus(c.status)),
                elt('td', { style: 'padding: 15px;' }, formatDate(c.activationDate)),
                elt('td', { style: 'padding: 15px;' }, formatDate(c.expiryDate)),
                actionsCell
            );
            tbody.append(tr);
        });
    };

    refreshList();
    table.append(thead, tbody);
    tableContainer.append(table);

    container.append(form, searchPanel, tableContainer);
}


function translateStatus(s) {
    const map = { 'new': 'جديد', 'active': 'نشط', 'expired': 'منتهي', 'banned': 'محظور' };
    return map[s] || s;
}

function renderContentTab(container) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;

    const createSection = (title, formFields, onSubmit) => {
        const panel = elt('div', { className: 'glass-panel', style: 'padding: 20px; margin-bottom: 20px;' },
            elt('h3', { style: 'margin-bottom: 15px;' }, title)
        );
        const form = elt('div', { style: 'display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;' });

        const inputs = formFields.map(f => {
            const div = elt('div', { style: `flex: ${f.width || '1'}; min-width: 150px;` },
                elt('label', { style: 'display: block; margin-bottom: 5px; font-size: 0.9rem;' }, f.label)
            );
            let input;
            if (f.type === 'select') {
                input = elt('select', {});
                f.options && f.options.forEach(o => input.append(elt('option', { value: o.value }, o.text)));
                f.refresh = () => {
                    input.innerHTML = '';
                    if (f.getOptions) f.getOptions().forEach(o => input.append(elt('option', { value: o.value }, o.text)));
                };
                if (f.getOptions) f.refresh();
            } else {
                input = elt('input', { type: f.type || 'text', placeholder: f.placeholder || '' });
            }
            div.append(input);
            return { div, input, key: f.key, refresh: f.refresh };
        });

        const btn = elt('button', { className: 'btn btn-primary' }, 'إضافة');
        btn.onclick = () => {
            const data = {};
            inputs.forEach(i => data[i.key] = i.input.value);
            onSubmit(data);
            inputs.forEach(i => { if (i.input.tagName === 'INPUT') i.input.value = '' });
            document.querySelectorAll('select').forEach(s => {
                // Trigger global refresh? No, just rely on user action or reload for now.
                // Or re-render simplified:
            });
            showNotification('تمت الإضافة بنجاح');
            // Re-render tab to update lists in selects
            renderContentTab(container);
        };

        form.append(...inputs.map(i => i.div), btn);
        panel.append(form);
        return panel;
    };

    container.innerHTML = ''; // clear old

    const db = window.store.db;

    container.append(createSection('1. إضافة مادة', [
        { label: 'اسم المادة', key: 'title' },
        { label: 'رابط الصورة', key: 'image', placeholder: 'https://...' }
    ], (data) => window.store.addSubject(data.title, data.image)));

    container.append(createSection('2. إضافة مدرس', [
        {
            label: 'المادة', key: 'subjectId', type: 'select',
            getOptions: () => window.store.db.subjects.map(s => ({ value: s.id, text: s.title }))
        },
        { label: 'اسم المدرس', key: 'name' },
        { label: 'رابط الصورة', key: 'image' },
        { label: 'نبذة مختصرة', key: 'bio' }
    ], (d) => window.store.addTeacher(d.subjectId, d.name, d.image, d.bio)));

    container.append(createSection('3. إضافة وحدة دراسية', [
        {
            label: 'المدرس', key: 'teacherId', type: 'select',
            getOptions: () => window.store.db.teachers.map(t => ({ value: t.id, text: `${t.name} (${window.store.db.subjects.find(s => s.id == t.subjectId)?.title || '?'})` }))
        },
        { label: 'عنوان الوحدة', key: 'title' }
    ], (d) => {
        const db = window.store.db;
        db.units.push({ id: Date.now(), teacherId: parseInt(d.teacherId), title: d.title });
        window.store.save(db);
    }));

    container.append(createSection('4. إضافة درس / محتوى', [
        {
            label: 'الوحدة', key: 'unitId', type: 'select',
            getOptions: () => window.store.db.units.map(u => ({ value: u.id, text: u.title }))
        },
        { label: 'عنوان الدرس', key: 'title' },
        {
            label: 'النوع', key: 'type', type: 'select',
            options: [{ value: 'video', text: 'فيديو' }, { value: 'file', text: 'ملف' }, { value: 'quiz', text: 'اختبار' }],
            getOptions: () => [{ value: 'video', text: 'فيديو' }, { value: 'file', text: 'ملف' }, { value: 'quiz', text: 'اختبار' }]
        },
        { label: 'المحتوي (رابط فيديو / ملف)', key: 'content', placeholder: 'رابط أو JSON للإختبار' }
    ], (d) => {
        const db = window.store.db;
        let content = d.content;
        if (d.type === 'quiz') {
            try {
                if (!content.startsWith('[')) {
                    content = [{ question: 'سؤال تجريبي', options: ['أ', 'ب', 'ج', 'د'], correct: 0 }];
                } else {
                    content = JSON.parse(content);
                }
            } catch (e) {
                return showNotification('خطأ في تنسيق الاختبار JSON', 'error');
            }
        }

        db.lessons.push({
            id: Date.now(),
            unitId: parseInt(d.unitId),
            title: d.title,
            type: d.type,
            content: content
        });
        window.store.save(db);
    }));

    container.append(elt('p', { style: 'color: var(--text-muted); font-size: 0.8rem; margin-top: 10px;' },
        'ملاحظة: لإضافة اختبار، يجب أن يكون المحتوى بتنسيق JSON. مثال: [{"question":"سؤال؟","options":["إجابة1","إجابة2"],"correct":0}]'
    ));
}
