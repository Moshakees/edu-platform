// Admin View (Robust & Fixed)
window.AdminView = async function () {
    const elt = window.Utils.elt;
    const session = window.store.checkSession();
    const showNotification = window.Utils.showNotification;

    if (!session || session.role !== 'admin') {
        window.location.hash = '#login';
        return elt('div');
    }

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px; padding-bottom: 60px;' });

    // Header
    const header = elt('header', { className: 'main-header' },
        elt('div', { style: 'display:flex; align-items:center; gap:15px;' },
            elt('button', { className: 'btn btn-outline', onclick: () => window.location.hash = '#home', title: 'الرئيسية' }, elt('ion-icon', { name: 'home-outline' })),
            elt('h1', { style: 'margin-bottom:0;' }, 'لوحة التحكم')
        ),
        elt('button', { className: 'btn btn-outline', style: 'color: #ef4444; border-color: rgba(239, 68, 68, 0.3);', onclick: () => { if (confirm('هل تريد تسجيل الخروج؟')) window.store.logout(); }, title: 'تسجيل الخروج' }, elt('ion-icon', { name: 'log-out-outline', style: 'font-size: 1.2rem;' }))
    );

    // Nav Tabs
    const tabs = elt('div', { style: 'display: flex; gap: 10px; margin-bottom: 30px; border-bottom: 1px solid var(--surface-border); padding-bottom: 10px; overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling: touch;' });

    const tabCodes = elt('button', { className: 'btn btn-primary' }, elt('ion-icon', { name: 'people-outline' }), 'المستخدمين');
    const tabPayments = elt('button', { className: 'btn btn-outline' }, elt('ion-icon', { name: 'card-outline' }), 'الاشتراكات');
    const tabContent = elt('button', { className: 'btn btn-outline' }, elt('ion-icon', { name: 'layers-outline' }), 'إدارة المحتوى');

    tabs.append(tabCodes, tabPayments, tabContent);
    const contentArea = elt('div', { id: 'admin-content' });

    const switchTab = (activeBtn) => {
        [tabCodes, tabPayments, tabContent].forEach(b => {
            b.className = 'btn btn-outline';
            b.style.flexShrink = '0';
        });
        activeBtn.className = 'btn btn-primary';
        contentArea.innerHTML = '<div style="text-align:center; padding:50px;"><div class="spinner"></div><p style="margin-top:20px; color:var(--text-muted);">جاري التحميل...</p></div>';
    };

    tabCodes.onclick = async () => { switchTab(tabCodes); await renderCodesTab(contentArea); };
    tabPayments.onclick = async () => { switchTab(tabPayments); await renderPaymentsTab(contentArea); };
    tabContent.onclick = async () => { switchTab(tabContent); await renderContentTab(contentArea); };

    // Initial Load
    container.append(header, tabs, contentArea);
    tabCodes.click();

    return container;
};

// --- التبويبات ---

async function renderCodesTab(container) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;
    const formatDate = window.Utils.formatDate;

    try {
        const codes = await window.store.getCodes();
        container.innerHTML = ''; // مسح التحميل

        // نموذج إضافة كود
        const nameInput = elt('input', { type: 'text', placeholder: 'اسم الطالب' });
        const daysInput = elt('input', { type: 'number', value: '30' });
        const addPanel = elt('div', { className: 'glass-panel', style: 'padding: 20px; margin-bottom: 25px; display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;' },
            elt('div', { style: 'flex: 1; min-width: 200px;' }, elt('label', { style: 'display: block; margin-bottom: 5px; font-size: 0.8rem;' }, 'اسم الطالب الجديد'), nameInput),
            elt('div', { style: 'width: 100px;' }, elt('label', { style: 'display: block; margin-bottom: 5px; font-size: 0.8rem;' }, 'الأيام'), daysInput),
            elt('button', {
                className: 'btn btn-primary', style: 'height: 48px;', onclick: async () => {
                    if (!nameInput.value) return showNotification('يرجى إدخال الاسم', 'error');
                    await window.store.generateCode(nameInput.value, daysInput.value);
                    showNotification('تم توليد الكود');
                    renderCodesTab(container);
                }
            }, 'توليد')
        );

        // جدول الأكواد
        const tbody = elt('tbody');
        const fillTable = (data) => {
            tbody.innerHTML = '';
            data.forEach(c => {
                tbody.append(elt('tr', { style: 'border-bottom: 1px solid var(--surface-border);' },
                    elt('td', { style: 'padding: 12px; font-family: monospace;' }, c.code),
                    elt('td', { style: 'padding: 12px;' }, c.name),
                    elt('td', { style: 'padding: 12px;' }, elt('span', { className: 'badge' }, c.status)),
                    elt('td', { style: 'padding: 12px;' }, formatDate(c.expiry_date)),
                    elt('td', { style: 'padding: 12px; display:flex; gap:5px;' },
                        elt('button', { className: 'btn btn-outline', style: 'font-size:0.7rem; padding:5px;', onclick: async () => { if (confirm('حظر/فك حظر؟')) { await window.store.updateCodeStatus(c.code, c.status === 'banned' ? 'active' : 'banned'); renderCodesTab(container); } } }, 'حظر'),
                        elt('button', { className: 'btn btn-outline', style: 'font-size:0.7rem; padding:5px; color:#ef4444;', onclick: async () => { if (confirm('حذف؟')) { await window.store.deleteCode(c.code); renderCodesTab(container); } } }, 'حذف')
                    )
                ));
            });
        };

        const searchInput = elt('input', { type: 'text', placeholder: 'ابحث عن طالب أو كود...', style: 'margin-bottom:15px;' });
        searchInput.oninput = () => {
            const term = searchInput.value.toLowerCase();
            fillTable(codes.filter(c => c.code.includes(term) || c.name.toLowerCase().includes(term)));
        };

        const tableWrap = elt('div', { className: 'glass-panel', style: 'overflow-x: auto;' },
            elt('table', { style: 'width: 100%; border-collapse: collapse; min-width: 600px; text-align:right;' },
                elt('thead', {}, elt('tr', { style: 'background:rgba(255,255,255,0.05)' },
                    ['الكود', 'الاسم', 'الحالة', 'الانتهاء', 'إجراءات'].map(h => elt('th', { style: 'padding:12px;' }, h))
                )),
                tbody
            )
        );

        container.append(addPanel, searchInput, tableWrap);
        fillTable(codes);

    } catch (err) {
        container.innerHTML = '<p style="color:red; text-align:center;">حدث خطأ أثناء تحميل البيانات</p>';
    }
}

async function renderPaymentsTab(container) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;

    try {
        const [num, payments] = await Promise.all([
            window.store.getSettings('cash_number'),
            window.store.getPayments()
        ]);
        container.innerHTML = '';

        // تعديل الرقم
        const numInput = elt('input', { value: num, placeholder: '01XXXXXXXXX' });
        const settings = elt('div', { className: 'glass-panel', style: 'padding: 20px; margin-bottom: 25px; display: flex; gap: 10px; align-items: flex-end;' },
            elt('div', { style: 'flex:1;' }, elt('label', { style: 'display:block; margin-bottom:5px; font-size:0.8rem;' }, 'رقم استقبال فودافون كاش'), numInput),
            elt('button', { className: 'btn btn-primary', onclick: async () => { await window.store.updateSettings('cash_number', numInput.value); showNotification('تم الحفظ'); } }, 'حفظ الرقم')
        );

        // قائمة المدفوعات
        const table = elt('div', { className: 'glass-panel', style: 'overflow-x: auto;' },
            elt('table', { style: 'width: 100%; border-collapse: collapse; min-width: 800px; text-align:right;' },
                elt('thead', {}, elt('tr', { style: 'background:rgba(255,255,255,0.05)' },
                    ['التاريخ', 'الطالب', 'رقم المحول', 'الباقة', 'الصورة', 'الحالة', 'إجراءات'].map(h => elt('th', { style: 'padding:12px;' }, h))
                )),
                elt('tbody', {}, ...payments.map(p => elt('tr', { style: 'border-bottom:1px solid var(--surface-border)' },
                    elt('td', { style: 'padding:12px; font-size:0.8rem;' }, new Date(p.created_at).toLocaleDateString('ar-EG')),
                    elt('td', { style: 'padding:12px;' }, p.student_name),
                    elt('td', { style: 'padding:12px; font-family:monospace;' }, p.student_phone),
                    elt('td', { style: 'padding:12px;' }, p.plan_type === 'monthly' ? 'شهري' : 'سنوي'),
                    elt('td', { style: 'padding:12px;' }, p.screenshot_url ? elt('button', { className: 'btn btn-outline', style: 'font-size:0.6rem; padding:4px;', onclick: () => window.open(p.screenshot_url, '_blank') }, 'عرض') : 'لا يوجد'),
                    elt('td', { style: 'padding:12px;' }, elt('span', { className: 'badge' }, p.status)),
                    elt('td', { style: 'padding:12px; display:flex; gap:5px;' },
                        p.status === 'pending' ? [
                            elt('button', { className: 'btn btn-outline', style: 'color:#10b981; font-size:0.7rem;', onclick: async () => { if (confirm('قبول؟')) { await window.store.updatePaymentStatus(p.id, 'completed'); renderPaymentsTab(container); } } }, 'قبول'),
                            elt('button', { className: 'btn btn-outline', style: 'color:#ef4444; font-size:0.7rem;', onclick: async () => { if (confirm('رفض؟')) { await window.store.updatePaymentStatus(p.id, 'failed'); renderPaymentsTab(container); } } }, 'رفض')
                        ] : null
                    )
                )))
            )
        );

        container.append(settings, table);
        if (payments.length === 0) table.innerHTML = '<p style="padding:40px; text-align:center; color:var(--text-muted);">لا توجد طلبات حالياً</p>';

    } catch (err) {
        container.innerHTML = '<p style="color:red; text-align:center;">حدث خطأ في تحميل المدفوعات</p>';
    }
}

async function renderContentTab(container) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;

    try {
        const db = await window.store.fetchAllData();
        container.innerHTML = '';

        const createSection = (title, fields, onSubmit) => {
            const panel = elt('div', { className: 'glass-panel', style: 'padding: 20px; margin-bottom: 25px;' },
                elt('h3', { style: 'margin-bottom: 15px; border-bottom: 1px solid var(--surface-border); padding-bottom: 10px;' }, title)
            );
            const form = elt('div', { style: 'display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;' });

            const inputs = fields.map(f => {
                const holder = elt('div', { style: 'flex: 1; min-width: 150px;' }, elt('label', { style: 'display:block; margin-bottom:5px; font-size:0.8rem;' }, f.label));
                let input;
                if (f.type === 'select') {
                    input = elt('select', { style: 'width:100%' });
                    const options = f.options ? f.options() : [];
                    options.forEach(o => input.append(elt('option', { value: o.id }, o.title || o.name || o.text)));
                } else {
                    input = elt('input', { type: f.type || 'text', placeholder: f.placeholder || '', style: 'width:100%' });
                }
                holder.append(input);
                return { key: f.key, input };
            });

            const submitBtn = elt('button', {
                className: 'btn btn-primary', onclick: async (e) => {
                    const btn = e.target;
                    const data = {};
                    inputs.forEach(i => data[i.key] = i.input.value);

                    btn.disabled = true;
                    btn.textContent = 'جاري الإضافة...';
                    try {
                        await onSubmit(data);
                        showNotification('تمت الإضافة بنجاح');
                        await renderContentTab(container);
                    } catch (err) {
                        showNotification('خطأ في العملية', 'error');
                        btn.disabled = false;
                        btn.textContent = 'إضافة';
                    }
                }
            }, 'إضافة');

            form.append(...inputs.map(i => i.input.parentElement), submitBtn);
            panel.append(form);
            return panel;
        };

        // الأقسام
        container.append(
            createSection('🌅 صور السلايدر ورأس الصفحة',
                [{ label: 'رابط الصورة', key: 'url', placeholder: 'https://...' }],
                d => window.store.addSliderImage(d.url)),

            createSection('📚 إضافة مادة دراسية',
                [{ label: 'اسم المادة', key: 'title' }, { label: 'رابط الأيقونة', key: 'image' }],
                d => window.store.addSubject(d.title, d.image)),

            createSection('👨‍🏫 إضافة مدرس',
                [
                    { label: 'المادة', key: 'sid', type: 'select', options: () => db.subjects },
                    { label: 'اسم المدرس', key: 'name' }
                ],
                d => window.store.addTeacher(d.sid, d.name, '', '')),

            createSection('📦 إضافة وحدة دراسية',
                [
                    { label: 'المدرس', key: 'tid', type: 'select', options: () => db.teachers },
                    { label: 'اسم الوحدة', key: 'title' }
                ],
                d => window.store.addUnit(d.tid, d.title)),

            createSection('📄 إضافة درس أو اختبار',
                [
                    { label: 'الوحدة', key: 'uid', type: 'select', options: () => db.units },
                    { label: 'عنوان الدرس', key: 'title' },
                    { label: 'النوع', key: 'type', type: 'select', options: () => [{ id: 'video', text: 'فيديو' }, { id: 'quiz', text: 'اختبار' }] },
                    { label: 'الرابط أو الكويز', key: 'content', placeholder: 'رابط فيديو أو JSON الاختبار' }
                ],
                d => window.store.addLesson(d.uid, d.title, d.type, d.content))
        );

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red; text-align:center;">حدث خطأ أثناء تحميل بيانات المحتوى</p>';
    }
}
