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
    const tabContent = elt('button', { className: 'btn btn-outline' }, 'إدارة المحتوى');

    tabs.append(tabCodes, tabContent);
    const contentArea = elt('div', { id: 'admin-content' });

    const switchTab = (activeBtn) => {
        [tabCodes, tabContent].forEach(b => {
            b.className = 'btn btn-outline';
        });
        activeBtn.className = 'btn btn-primary tab-active';
        contentArea.innerHTML = '';
    };

    tabCodes.onclick = async () => { switchTab(tabCodes); await renderCodesTab(contentArea); };
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

// --- تبويب المحتوى ---
async function renderContentTab(container) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;
    const db = await window.store.fetchAllData();
    container.innerHTML = '';
    container.append(
        createSection('0. صور السلايدر', [{ label: 'رابط الصورة المباشر', key: 'url', placeholder: 'https://...' }], d => window.store.addSliderImage(d.url), db.slider, id => window.store.deleteSliderImage(id)),
        createSection('1. إضافة مادة', [{ label: 'اسم المادة', key: 'title' }, { label: 'رابط الصورة', key: 'image' }], d => window.store.addSubject(d.title, d.image), db.subjects, id => window.store.deleteSubject(id)),
        createSection('2. إضافة مدرس', [{ label: 'المادة', key: 'sid', type: 'select', options: () => db.subjects }, { label: 'اسم المدرس', key: 'name' }, { label: 'الصورة', key: 'image' }, { label: 'نبذة', key: 'bio' }], d => window.store.addTeacher(d.sid, d.name, d.image, d.bio), db.teachers, id => window.store.deleteTeacher(id)),
        createSection('3. إضافة وحدة', [{ label: 'المدرس', key: 'tid', type: 'select', options: () => db.teachers }, { label: 'اسم الوحدة', key: 'title' }], d => window.store.addUnit(d.tid, d.title), db.units, id => window.store.deleteUnit(id)),
        createSection('4. إضافة درس', [
            { label: 'الوحدة', key: 'uid', type: 'select', options: () => db.units },
            { label: 'العنوان', key: 'title' },
            { label: 'النوع', key: 'type', type: 'select', options: () => [{ id: 'video', title: 'فيديو' }, { id: 'quiz', title: 'اختبار' }, { id: 'file', title: 'ملف PDF / مذكرة' }] },
            { label: 'المحتوى (رابط الفيديو أو JSON)', key: 'content' }
        ], async (d, file) => {
            let content = d.content;
            if (d.type === 'file' && file) {
                showNotification('جاري رفع الملف...', 'success');
                content = await window.store.uploadFile(file);
            }
            if (d.type === 'quiz' && typeof content === 'string') {
                try { content = JSON.parse(content || '[]'); } catch (e) { showNotification('خطأ JSON', 'error'); return; }
            }
            return window.store.addLesson(d.uid, d.title, d.type, content);
        }, db.lessons, id => window.store.deleteLesson(id))
    );
}

// المساعد في بناء الأقسام مع منطق باني الاختبارات وقائمة العناصر المضافة
function createSection(title, fields, onSubmit, items = [], onDelete = null) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;
    const panel = elt('div', { className: 'glass-panel', style: 'padding: 20px; margin-bottom: 25px;' }, elt('h3', { style: 'margin-bottom: 20px;' }, title));
    const form = elt('div', { style: 'display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;' });

    let quizBuilder = null;
    let quizData = [];

    const inputs = fields.map(f => {
        const d = elt('div', { style: 'flex: 1; min-width: 150px;' }, elt('label', { style: 'display:block;margin-bottom:5px;font-size:0.8rem;' }, f.label));
        let input;
        if (f.type === 'select') {
            input = elt('select', {});
            f.options().forEach(o => input.append(elt('option', { value: o.id }, o.title || o.name || o.text)));
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
        if (title === '4. إضافة درس' && data.type === 'quiz') {
            if (quizData.length === 0) return showNotification('أضف سؤالاً واحداً على الأقل', 'error');
            data.content = quizData;
        }
        try {
            await onSubmit(data);
            showNotification('تمت الإضافة بنجاح');
            renderContentTab(document.getElementById('admin-content'));
        } catch (e) {
            showNotification('حدث خطأ أثناء الحفظ', 'error');
        }
    };

    form.append(...inputs.map(i => i.input.parentElement), btn);
    panel.append(form);

    if (title === '4. إضافة درس') {
        const typeSelect = inputs.find(i => i.key === 'type').input;
        const contentInput = inputs.find(i => i.key === 'content').input;
        const fileIn = elt('input', { type: 'file', style: 'display:none; margin-top:10px;' });
        panel.append(fileIn);

        // تعديل سلوك الزر ليدعم الملف
        btn.onclick = async () => {
            const data = {};
            inputs.forEach(i => data[i.key] = i.input.value);
            if (data.type === 'quiz') {
                if (quizData.length === 0) return showNotification('أضف سؤالاً واحداً على الأقل', 'error');
                data.content = quizData;
            }
            try {
                // نمرر الملف المختار كمعامل ثاني
                await onSubmit(data, fileIn.files[0]);
                showNotification('تمت الإضافة بنجاح');
                renderContentTab(document.getElementById('admin-content'));
            } catch (e) {
                showNotification(e.message || 'حدث خطأ أثناء الحفظ', 'error');
            }
        };

        quizBuilder = elt('div', { style: 'display:none; margin-top:20px; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;' });

        const renderBuilder = () => {
            quizBuilder.innerHTML = '<h4>باني الاختبارات</h4>';
            quizData.forEach((q, idx) => {
                quizBuilder.append(elt('div', { style: 'background:rgba(255,255,255,0.05); padding:10px; margin-bottom:5px; border-radius:8px; display:flex; justify-content:space-between;' },
                    elt('span', {}, `${idx + 1}. ${q.question}`),
                    elt('button', { style: 'color:#ef4444; background:none; border:none; cursor:pointer;', onclick: () => { quizData.splice(idx, 1); renderBuilder(); } }, 'حذف')
                ));
            });
            const qIn = elt('input', { placeholder: 'السؤال' });
            const opts = [elt('input', { placeholder: '1' }), elt('input', { placeholder: '2' }), elt('input', { placeholder: '3' }), elt('input', { placeholder: '4' })];
            const correct = elt('select', {}, [0, 1, 2, 3].map(i => elt('option', { value: i }, `الاختيار ${i + 1} هو الصحيح`)));
            const addBtn = elt('button', { className: 'btn btn-outline', style: 'margin-top:10px;' }, 'حفظ السؤال');
            addBtn.onclick = () => {
                if (!qIn.value || opts.some(o => !o.value)) return showNotification('أكمل السؤال', 'error');
                quizData.push({ question: qIn.value, options: opts.map(o => o.value), correct: parseInt(correct.value) });
                renderBuilder();
            };
            quizBuilder.append(elt('div', { style: 'display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px' }, qIn, ...opts, correct), addBtn);
        };

        typeSelect.onchange = () => {
            const val = typeSelect.value;
            contentInput.parentElement.style.display = (val === 'video' || val === 'video-link') ? 'block' : 'none';
            quizBuilder.style.display = val === 'quiz' ? 'block' : 'none';
            fileIn.style.display = val === 'file' ? 'block' : 'none';
            if (val === 'quiz') renderBuilder();
        };
        panel.append(quizBuilder);
    }

    // عرض القائمة الموجودة
    if (items && items.length > 0) {
        const listDiv = elt('div', { style: 'margin-top:20px; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px; overflow-x:auto;' });
        const table = elt('table', { style: 'width:100%; text-align:right; font-size:0.9rem;' },
            elt('thead', {}, elt('tr', { style: 'opacity:0.6;' },
                elt('th', { style: 'padding:5px;' }, 'العنصر'),
                onDelete ? elt('th', { style: 'padding:5px; width:80px;' }, 'إجراء') : null
            )),
            elt('tbody', {}, ...items.map(item => elt('tr', { style: 'border-bottom:1px solid rgba(255,255,255,0.05);' },
                elt('td', { style: 'padding:10px;' }, item.title || item.name || item.image_url || 'بدون عنوان'),
                onDelete ? elt('td', { style: 'padding:10px;' },
                    elt('button', {
                        className: 'btn btn-outline',
                        style: 'color:#ef4444; padding:5px 10px; font-size:0.7rem;',
                        onclick: async () => {
                            if (confirm('هل أنت متأكد من الحذف؟')) {
                                try {
                                    await onDelete(item.id);
                                    showNotification('تم الحذف');
                                    renderContentTab(document.getElementById('admin-content'));
                                } catch (e) {
                                    showNotification('خطأ في الحذف', 'error');
                                }
                            }
                        }
                    }, 'حذف')
                ) : null
            )))
        );
        listDiv.append(table);
        panel.append(listDiv);
    }

    return panel;
}
