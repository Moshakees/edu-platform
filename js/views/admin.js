// Admin View
window.AdminView = async function () {
    const elt = window.Utils.elt;
    const session = window.store.checkSession();

    if (!session || session.role !== 'admin') {
        window.location.hash = '#login';
        return elt('div');
    }

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px; padding-bottom: 60px;' });

    const header = elt('header', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;' },
        elt('h1', {}, 'لوحة التحكم (Live)'),
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

    tabCodes.onclick = async () => {
        switchTab(tabCodes);
        await renderCodesTab(contentArea);
    };

    tabContent.onclick = async () => {
        switchTab(tabContent);
        await renderContentTab(contentArea);
    };

    // التشغيل الافتراضي
    tabCodes.click();

    container.append(header, tabs, contentArea);
    return container;
};

async function renderCodesTab(container) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;
    const formatDate = window.Utils.formatDate;

    // نموذج التوليد
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

    genBtn.onclick = async () => {
        const name = nameInput.lastChild.value;
        const days = daysInput.lastChild.value;
        if (!name || !days) return showNotification('جميع الحقول مطلوبة', 'error');
        await window.store.generateCode(name, days);
        showNotification('تم إنشاء الكود بنجاح');
        nameInput.lastChild.value = '';
        refreshList();
    };
    form.append(nameInput, daysInput, genBtn);

    // البحث والجدول
    const searchPanel = elt('div', { className: 'glass-panel', style: 'padding: 15px; margin-bottom: 20px; display: flex; gap: 10px; align-items: center;' });
    const searchInput = elt('input', { type: 'text', placeholder: 'ابحث عن مستخدم بالكود أو الاسم...', style: 'flex: 1; direction: ltr;' });
    searchPanel.append(elt('ion-icon', { name: 'search-outline' }), searchInput);

    const tableContainer = elt('div', { className: 'glass-panel', style: 'overflow-x: auto;' });
    const tbody = elt('tbody');

    const refreshList = async (searchTerm = '') => {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:20px; text-align:center;">جاري التحميل...</td></tr>';
        let codes = await window.store.getCodes();

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            codes = codes.filter(c => c.code.includes(term) || c.name.toLowerCase().includes(term));
        }

        tbody.innerHTML = '';
        codes.forEach(c => {
            const tr = elt('tr', { style: 'border-bottom: 1px solid var(--surface-border);' });

            const banBtn = elt('button', { className: 'btn btn-outline', style: 'font-size: 0.8rem;' }, c.status === 'banned' ? 'فك الحظر' : 'حظر');
            banBtn.onclick = async () => {
                await window.store.updateCodeStatus(c.code, c.status === 'banned' ? (c.activation_date ? 'active' : 'new') : 'banned');
                refreshList(searchInput.value);
            };

            const renewBtn = elt('button', { className: 'btn btn-primary', style: 'font-size: 0.8rem; margin-right: 5px;' }, 'تجديد');
            renewBtn.onclick = async () => {
                const d = prompt('أيام الإضافة؟', '30');
                if (d) { await window.store.renewCode(c.code, d); refreshList(searchInput.value); }
            };

            const actions = elt('td', { style: 'padding: 15px;' });
            actions.append(renewBtn, banBtn);

            tr.append(
                elt('td', { style: 'padding: 15px; font-weight: bold; font-family: monospace; direction: ltr;' }, c.code),
                elt('td', { style: 'padding: 15px;' }, c.name),
                elt('td', { style: 'padding: 15px;' }, c.status),
                elt('td', { style: 'padding: 15px;' }, formatDate(c.activation_date)),
                elt('td', { style: 'padding: 15px;' }, formatDate(c.expiry_date)),
                actions
            );
            tbody.append(tr);
        });
    };

    searchInput.oninput = () => refreshList(searchInput.value);

    const table = elt('table', { style: 'width: 100%; border-collapse: collapse; min-width: 700px;' },
        elt('thead', {}, elt('tr', {},
            elt('th', { style: 'padding:15px;text-align:right' }, 'الكود'),
            elt('th', { style: 'padding:15px;text-align:right' }, 'الاسم'),
            elt('th', { style: 'padding:15px;text-align:right' }, 'الحالة'),
            elt('th', { style: 'padding:15px;text-align:right' }, 'التفعيل'),
            elt('th', { style: 'padding:15px;text-align:right' }, 'الانتهاء'),
            elt('th', { style: 'padding:15px;text-align:right' }, 'إجراءات')
        )),
        tbody
    );

    refreshList();
    tableContainer.append(table);
    container.append(form, searchPanel, tableContainer);
}

async function renderContentTab(container) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;

    container.innerHTML = '<p style="text-align:center;">جاري تحميل المحتوى...</p>';
    const db = await window.store.fetchAllData();
    container.innerHTML = '';

    const createSection = (title, fields, onSubmit) => {
        const panel = elt('div', { className: 'glass-panel', style: 'padding: 20px; margin-bottom: 20px;' },
            elt('h3', { style: 'margin-bottom: 15px;' }, title)
        );
        const form = elt('div', { style: 'display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;' });

        const inputs = fields.map(f => {
            const d = elt('div', { style: 'flex: 1; min-width: 150px;' }, elt('label', { style: 'display:block;margin-bottom:5px;font-size:0.8rem;' }, f.label));
            let input;
            if (f.type === 'select') {
                input = elt('select', {});
                f.options().forEach(o => input.append(elt('option', { value: o.id }, o.title)));
            } else {
                input = elt('input', { type: f.type || 'text', placeholder: f.placeholder });
            }
            d.append(input);
            return { key: f.key, input };
        });

        const btn = elt('button', { className: 'btn btn-primary' }, 'إضافة');
        btn.onclick = async () => {
            const data = {};
            inputs.forEach(i => data[i.key] = i.input.value);
            await onSubmit(data);
            showNotification('تمت الإضافة بنجاح');
            renderContentTab(container);
        };

        form.append(...inputs.map(i => i.input.parentElement), btn);
        panel.append(form);
        return panel;
    };

    // نموذج المواد
    container.append(createSection('1. إضافة مادة', [{ label: 'اسم المادة', key: 'title' }, { label: 'رابط الصورة', key: 'image' }],
        d => window.store.addSubject(d.title, d.image)));

    // المدرسين
    container.append(createSection('2. إضافة مدرس', [
        { label: 'المادة', key: 'subjectId', type: 'select', options: () => db.subjects },
        { label: 'اسم المدرس', key: 'name' },
        { label: 'رابط الصورة', key: 'image' },
        { label: 'نبذة', key: 'bio' }
    ], d => window.store.addTeacher(d.subjectId, d.name, d.image, d.bio)));

    // الوحدات
    container.append(createSection('3. إضافة وحدة', [
        { label: 'المدرس', key: 'teacherId', type: 'select', options: () => db.teachers },
        { label: 'عنوان الوحدة', key: 'title' }
    ], d => window.store.addUnit(d.teacherId, d.title)));

    // الدروس
    container.append(createSection('4. إضافة درس', [
        { label: 'الوحدة', key: 'unitId', type: 'select', options: () => db.units },
        { label: 'العنوان', key: 'title' },
        { label: 'النوع', key: 'type', type: 'select', options: () => [{ id: 'video', title: 'فيديو' }, { id: 'file', title: 'ملف' }, { id: 'quiz', title: 'اختبار' }] },
        { label: 'المحتوي', key: 'content' }
    ], d => {
        let content = d.content;
        if (d.type === 'quiz') content = JSON.parse(content || '[]');
        return window.store.addLesson(d.unitId, d.title, d.type, content);
    }));

    // إدارة الحذف
    const manageArea = elt('div', { style: 'margin-top: 40px;' }, elt('h2', {}, 'إدارة المحتوى الحالي'));
    db.subjects.forEach(s => {
        const item = elt('div', { className: 'glass-panel', style: 'padding: 10px 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;' },
            elt('span', {}, `المادة: ${s.title}`),
            elt('button', { className: 'btn btn-outline', style: 'color:red; border-color:red; font-size:0.8rem;', onclick: async () => { if (confirm('متأكد؟')) { await window.store.deleteSubject(s.id); renderContentTab(container); } } }, 'حذف')
        );
        manageArea.append(item);
    });
    container.append(manageArea);
}
