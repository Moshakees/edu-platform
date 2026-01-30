// Admin View
window.AdminView = async function () {
    const elt = window.Utils.elt;
    const session = window.store.checkSession();

    if (!session || session.role !== 'admin') {
        window.location.hash = '#login';
        return elt('div');
    }

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px; padding-bottom: 60px;' });

    const header = elt('header', { className: 'main-header' },
        elt('div', { style: 'display:flex; align-items:center; gap:15px;' },
            elt('button', { className: 'btn btn-outline', onclick: () => window.location.hash = '#home', title: 'الرئيسية' }, elt('ion-icon', { name: 'home-outline' })),
            elt('h1', { style: 'margin-bottom:0;' }, 'لوحة التحكم')
        ),
        elt('button', { className: 'btn btn-outline', style: 'color: #ef4444; border-color: rgba(239, 68, 68, 0.3);', onclick: () => { if (confirm('هل تريد تسجيل الخروج؟')) window.store.logout(); }, title: 'تسجيل الخروج' }, elt('ion-icon', { name: 'log-out-outline', style: 'font-size: 1.2rem;' }))
    );

    const tabs = elt('div', { style: 'display: flex; gap: 15px; margin-bottom: 30px; border-bottom: 1px solid var(--surface-border); padding-bottom: 10px; overflow-x:auto;' });
    const tabCodes = elt('button', { className: 'btn btn-primary' }, 'المستخدمين');
    const tabPayments = elt('button', { className: 'btn btn-outline' }, 'الاشتراكات');
    const tabContent = elt('button', { className: 'btn btn-outline' }, 'إدارة المحتوى');

    tabs.append(tabCodes, tabPayments, tabContent);
    const contentArea = elt('div', { id: 'admin-content' });

    const switchTab = (activeBtn) => {
        [tabCodes, tabPayments, tabContent].forEach(b => {
            b.className = 'btn btn-outline';
        });
        activeBtn.className = 'btn btn-primary tab-active';
        contentArea.innerHTML = '';
    };

    tabCodes.onclick = async () => { switchTab(tabCodes); await renderCodesTab(contentArea); };
    tabPayments.onclick = async () => { switchTab(tabPayments); await renderPaymentsTab(contentArea); };
    tabContent.onclick = async () => { switchTab(tabContent); await renderContentTab(contentArea); };

    tabCodes.click();
    container.append(header, tabs, contentArea);
    return container;
};

// --- تبويب الأكواد ---
async function renderCodesTab(container) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;
    const formatDate = window.Utils.formatDate;

    container.innerHTML = '';

    const form = elt('div', { className: 'glass-panel', style: 'padding: 20px; margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;' });
    const nameInput = elt('div', { style: 'flex: 1; min-width: 200px;' },
        elt('label', { style: 'display: block; margin-bottom: 5px;' }, 'اسم الطالب'),
        elt('input', { id: 'gen-name', type: 'text', placeholder: 'مثال: أحمد محمد' })
    );
    const daysInput = elt('div', { style: 'width: 150px;' },
        elt('label', { style: 'display: block; margin-bottom: 5px;' }, 'المدة (أيام)'),
        elt('input', { id: 'gen-days', type: 'number', value: '30' })
    );
    const genBtn = elt('button', { className: 'btn btn-primary', style: 'height: 48px;' }, 'توليد كود');

    genBtn.onclick = async () => {
        const name = document.getElementById('gen-name').value;
        const days = document.getElementById('gen-days').value;
        if (!name || !days) return showNotification('أكمل البيانات', 'error');
        await window.store.generateCode(name, days);
        showNotification('تم الإنشاء');
        document.getElementById('gen-name').value = '';
        refreshList();
    };
    form.append(nameInput, daysInput, genBtn);

    const searchPanel = elt('div', { className: 'glass-panel', style: 'padding: 15px; margin-bottom: 20px; display: flex; gap: 10px; align-items: center;' });
    const searchInput = elt('input', { type: 'text', placeholder: 'ابحث في المستخدمين...', style: 'flex: 1; direction: ltr;' });
    searchPanel.append(elt('ion-icon', { name: 'search-outline' }), searchInput);

    const tableContainer = elt('div', { className: 'glass-panel', style: 'overflow-x: auto;' });
    const tbody = elt('tbody');

    const refreshList = async () => {
        const searchTerm = searchInput.value || '';
        tbody.innerHTML = '<tr><td colspan="6" style="padding:20px; text-align:center;">جاري التحميل...</td></tr>';
        let codes = await window.store.getCodes();
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            codes = codes.filter(c => c.code.includes(term) || c.name.toLowerCase().includes(term));
        }
        tbody.innerHTML = '';
        codes.forEach(c => {
            const actions = elt('td', { style: 'padding: 10px;' },
                elt('button', { className: 'btn btn-primary', style: 'font-size: 0.7rem;', onclick: async () => { const d = prompt('أيام التجديد؟', '30'); if (d) { await window.store.renewCode(c.code, d); refreshList(); } } }, 'تجديد'),
                elt('button', { className: 'btn btn-outline', style: 'font-size: 0.7rem; margin:0 5px;', onclick: async () => { await window.store.updateCodeStatus(c.code, c.status === 'banned' ? 'active' : 'banned'); refreshList(); } }, c.status === 'banned' ? 'فك' : 'حظر'),
                elt('button', { className: 'btn btn-outline', style: 'font-size: 0.7rem; color:#ef4444;', onclick: async () => { if (confirm('حذف؟')) { await window.store.deleteCode(c.code); refreshList(); } } }, 'حذف')
            );
            tbody.append(elt('tr', { style: 'border-bottom: 1px solid var(--surface-border);' },
                elt('td', { style: 'padding: 12px; font-family: monospace;' }, c.code),
                elt('td', { style: 'padding: 12px;' }, c.name),
                elt('td', { style: 'padding: 12px;' }, c.status),
                elt('td', { style: 'padding: 12px;' }, formatDate(c.activation_date)),
                elt('td', { style: 'padding: 12px;' }, formatDate(c.expiry_date)),
                actions
            ));
        });
    };

    searchInput.oninput = refreshList;
    tableContainer.append(elt('table', { style: 'width: 100%; border-collapse: collapse; min-width: 700px; text-align:right;' },
        elt('thead', {}, elt('tr', { style: 'background:rgba(255,255,255,0.05)' },
            ['الكود', 'الاسم', 'الحالة', 'التفعيل', 'الانتهاء', 'إجراءات'].map(h => elt('th', { style: 'padding:12px;' }, h))
        )),
        tbody
    ));

    refreshList();
    container.append(form, searchPanel, tableContainer);
}

// --- تبويب الاشتراكات ---
async function renderPaymentsTab(container) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;

    container.innerHTML = '<div style="text-align:center; padding:50px;"><div class="spinner"></div></div>';

    const [num, payments] = await Promise.all([
        window.store.getSettings('cash_number'),
        window.store.getPayments()
    ]);

    container.innerHTML = '';

    // إعدادات الرقم
    const settings = elt('div', { className: 'glass-panel', style: 'padding: 20px; margin-bottom: 25px; display: flex; gap: 10px; align-items: flex-end;' },
        elt('div', { style: 'flex:1;' },
            elt('label', { style: 'display:block; margin-bottom:5px; font-size:0.8rem;' }, 'رقم استقبال الكاش'),
            elt('input', { id: 'admin-cash-num', value: num, placeholder: '01XXXXXXXXX' })
        ),
        elt('button', {
            className: 'btn btn-primary', onclick: async () => {
                await window.store.updateSettings('cash_number', document.getElementById('admin-cash-num').value);
                showNotification('تم الحفظ');
            }
        }, 'حفظ الرقم')
    );

    // جدول الاشتراكات
    const tableWrap = elt('div', { className: 'glass-panel', style: 'overflow-x: auto;' },
        elt('table', { style: 'width: 100%; border-collapse: collapse; min-width: 800px; text-align:right;' },
            elt('thead', {}, elt('tr', { style: 'background:rgba(255,255,255,0.05)' },
                ['الطالب', 'رقم المحول', 'الباقة', 'سكرين شوت', 'الحالة', 'إجراءات'].map(h => elt('th', { style: 'padding:12px;' }, h))
            )),
            elt('tbody', {}, ...payments.map(p => elt('tr', { style: 'border-bottom: 1px solid var(--surface-border);' },
                elt('td', { style: 'padding:12px;' }, p.student_name),
                elt('td', { style: 'padding:12px; font-family:monospace;' }, p.student_phone),
                elt('td', { style: 'padding:12px;' }, p.plan_type === 'monthly' ? 'شهري' : 'سنوي'),
                elt('td', { style: 'padding:12px;' }, p.screenshot_url ? elt('button', { className: 'btn btn-outline', style: 'font-size:0.7rem;', onclick: () => window.open(p.screenshot_url, '_blank') }, 'عرض') : 'لا يوجد'),
                elt('td', { style: 'padding:12px;' }, elt('span', { className: `badge badge-${p.status}` }, p.status === 'pending' ? 'انتظار' : (p.status === 'completed' ? 'تم' : 'فشل'))),
                elt('td', { style: 'padding:12px; display:flex; gap:5px;' },
                    p.status === 'pending' ? [
                        elt('button', { className: 'btn btn-outline', style: 'color:#10b981;', onclick: async () => { if (confirm('قبول؟')) { await window.store.updatePaymentStatus(p.id, 'completed'); renderPaymentsTab(container); } } }, 'قبول'),
                        elt('button', { className: 'btn btn-outline', style: 'color:#ef4444;', onclick: async () => { if (confirm('رفض؟')) { await window.store.updatePaymentStatus(p.id, 'failed'); renderPaymentsTab(container); } } }, 'رفض')
                    ] : null
                )
            )))
        )
    );

    container.append(settings, tableWrap);
    if (payments.length === 0) tableWrap.innerHTML = '<p style="padding:40px; text-align:center; color:var(--text-muted);">لا توجد طلبات اشتراك</p>';
}

// --- تبويب المحتوى ---
async function renderContentTab(container) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;
    const db = await window.store.fetchAllData();
    container.innerHTML = '';

    const createSection = (title, fields, onSubmit) => {
        const panel = elt('div', { className: 'glass-panel', style: 'padding: 20px; margin-bottom: 20px;' }, elt('h3', { style: 'margin-bottom: 15px;' }, title));
        const form = elt('div', { style: 'display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;' });
        const inputs = fields.map(f => {
            const d = elt('div', { style: 'flex: 1; min-width: 150px;' }, elt('label', { style: 'display:block;margin-bottom:5px;font-size:0.8rem;' }, f.label));
            let input = f.type === 'select' ? elt('select', {}) : elt('input', { type: f.type || 'text', placeholder: f.placeholder });
            if (f.type === 'select') f.options().forEach(o => input.append(elt('option', { value: o.id }, o.title || o.name || o.text)));
            d.append(input); return { key: f.key, input };
        });
        const btn = elt('button', {
            className: 'btn btn-primary', onclick: async () => {
                const data = {}; inputs.forEach(i => data[i.key] = i.input.value);
                try { await onSubmit(data); showNotification('تمت الإضافة'); renderContentTab(container); } catch (e) { showNotification('خطأ', 'error'); }
            }
        }, 'إضافة');
        form.append(...inputs.map(i => i.input.parentElement), btn); panel.append(form); return panel;
    };

    container.append(
        createSection('0. صور السلايدر', [{ label: 'الرابط', key: 'url' }], d => window.store.addSliderImage(d.url)),
        createSection('1. مادة جديدة', [{ label: 'الاسم', key: 'title' }, { label: 'الصورة', key: 'image' }], d => window.store.addSubject(d.title, d.image)),
        createSection('2. مدرس جديد', [{ label: 'المادة', key: 'sid', type: 'select', options: () => db.subjects }, { label: 'الاسم', key: 'name' }], d => window.store.addTeacher(d.sid, d.name, '', '')),
        createSection('3. وحدة جديدة', [{ label: 'المدرس', key: 'tid', type: 'select', options: () => db.teachers }, { label: 'العنوان', key: 'title' }], d => window.store.addUnit(d.tid, d.title)),
        createSection('4. درس جديد', [{ label: 'الوحدة', key: 'uid', type: 'select', options: () => db.units }, { label: 'العنوان', key: 'title' }, { label: 'النوع', key: 'type', type: 'select', options: () => [{ id: 'video', text: 'فيديو' }, { id: 'quiz', text: 'اختبار' }] }, { label: 'المحتوى', key: 'content' }], d => window.store.addLesson(d.uid, d.title, d.type, d.content))
    );
}
