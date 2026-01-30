// Login View
window.LoginView = function () {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;

    const renderLoginForm = () => {
        container.innerHTML = '';
        const formContent = elt('div', { className: 'glass-panel login-box' },
            elt('h1', { style: 'margin-bottom: 30px;' }, 'تسجيل الدخول'),
            elt('div', { style: 'margin-bottom: 20px;' },
                elt('label', { style: 'display: block; text-align: right; margin-bottom: 8px;' }, 'كود التفعيل'),
                elt('input', {
                    id: 'login-code',
                    type: 'text',
                    placeholder: 'أدخل الكود المكون من 8 أرقام',
                    style: 'text-align: center; font-size: 1.2rem; letter-spacing: 4px;'
                })
            ),
            elt('button', {
                className: 'btn btn-primary',
                style: 'width: 100%; margin-top: 10px;',
                onclick: async (e) => {
                    const btn = e.target;
                    const code = document.getElementById('login-code').value.trim();
                    if (!code) return showNotification('يرجى إدخال الكود', 'error');

                    btn.disabled = true;
                    btn.textContent = 'جاري التحقق...';

                    const result = await window.store.login(code);
                    if (result.success) {
                        showNotification('تم تسجيل الدخول بنجاح');
                        window.location.hash = '#home';
                        window.location.reload();
                    } else {
                        showNotification(result.message, 'error');
                        btn.disabled = false;
                        btn.textContent = 'تسجيل الدخول';
                    }
                }
            }, 'تسجيل الدخول'),
            elt('div', { style: 'margin-top: 30px; border-top: 1px solid var(--surface-border); padding-top: 20px;' },
                elt('p', { style: 'margin-bottom: 15px; color: var(--text-muted); font-size: 0.9rem;' }, 'ليس لديك كود؟'),
                elt('button', {
                    className: 'btn btn-outline',
                    style: 'width: 100%; gap: 10px;',
                    onclick: renderPaymentPage
                },
                    elt('ion-icon', { name: 'card-outline' }),
                    elt('span', {}, 'اشترك الآن')
                )
            )
        );
        container.append(formContent);
    };

    const renderPaymentPage = async () => {
        container.innerHTML = '';
        const cashNumber = await window.store.getSettings('cash_number');

        const pageContent = elt('div', { className: 'glass-panel', style: 'width: 100%; max-width: 500px; padding: 40px; position:relative;' },
            elt('button', {
                style: 'position:absolute; left:20px; top:20px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.5rem;',
                onclick: renderLoginForm
            }, elt('ion-icon', { name: 'close-outline' })),

            elt('h2', { style: 'text-align:center; margin-bottom:20px;' }, 'باقات الاشتراك'),

            elt('div', { style: 'display:flex; gap:10px; margin-bottom:30px;' },
                elt('div', { style: 'flex:1; padding:15px; border:2px solid var(--primary-color); border-radius:12px; text-align:center;' },
                    elt('h4', {}, 'شهري'),
                    elt('div', { style: 'font-size:1.5rem; font-weight:bold; color:var(--primary-color);' }, '50 ج.م'),
                    elt('p', { style: 'font-size:0.7rem; color:var(--text-muted);' }, 'صالحة لمدة 30 يوم')
                ),
                elt('div', { style: 'flex:1; padding:15px; border:1px solid var(--surface-border); border-radius:12px; text-align:center;' },
                    elt('h4', {}, 'سنوي'),
                    elt('div', { style: 'font-size:1.5rem; font-weight:bold;' }, '500 ج.م'),
                    elt('p', { style: 'font-size:0.7rem; color:var(--text-muted);' }, 'صالحة لمدة 365 يوم')
                )
            ),

            elt('div', { className: 'glass-panel', style: 'padding:15px; margin-bottom:25px; border-right:4px solid var(--secondary-color); font-size:0.9rem;' },
                elt('p', { style: 'font-weight:bold; margin-bottom:5px;' }, 'طريقة الدفع:'),
                elt('p', {}, `يرجى تحويل المبلغ المطلوب إلى رقم فودافون كاش التالي:`),
                elt('div', { style: 'font-size:1.4rem; font-weight:bold; letter-spacing:2px; color:var(--secondary-color); margin:10px 0; text-align:center;' }, cashNumber || '01XXXXXXXXX')
            ),

            elt('div', { style: 'display:flex; flex-direction:column; gap:15px;' },
                elt('input', { id: 'p-name', placeholder: 'اسمك الثلاثي' }),
                elt('input', { id: 'p-phone', placeholder: 'رقم الهاتف الذي حولت منه' }),
                elt('input', { id: 'p-telegram', placeholder: 'يوزر تيليجرام (للتواصل)' }),
                elt('div', { style: 'font-size:0.8rem; color:var(--text-muted); text-align:right;' }, 'اختر الباقة:'),
                elt('select', { id: 'p-plan' },
                    elt('option', { value: 'monthly' }, 'اشتراك شهري (50 جنيه)'),
                    elt('option', { value: 'yearly' }, 'اشتراك سنوي (500 جنيه)')
                ),
                elt('div', { style: 'text-align:right; font-size:0.8rem; color:var(--text-muted);' }, 'ارفاق صورة التحويل (سكرين شوت):'),
                elt('input', { id: 'p-file', type: 'file', accept: 'image/*', style: 'padding:5px;' }),
                elt('button', {
                    className: 'btn btn-primary',
                    style: 'margin-top:10px;',
                    onclick: async (e) => {
                        const name = document.getElementById('p-name').value;
                        const phone = document.getElementById('p-phone').value;
                        const telegram = document.getElementById('p-telegram').value;
                        const plan = document.getElementById('p-plan').value;
                        const fileInput = document.getElementById('p-file');

                        if (!name || !phone) return showNotification('يرجى كتابة الاسم ورقم الهاتف', 'error');
                        if (!fileInput.files[0]) return showNotification('يرجى إرفاق صورة التحويل (سكرين شوت)', 'error');

                        e.target.disabled = true;
                        e.target.textContent = 'جاري رفع الصورة...';

                        try {
                            const screenshotUrl = await window.store.uploadFile(fileInput.files[0]);
                            e.target.textContent = 'جاري إرسال الطلب...';

                            await window.store.submitPayment({
                                student_name: name,
                                student_phone: phone,
                                telegram_username: telegram,
                                plan_type: plan,
                                screenshot_url: screenshotUrl,
                                status: 'pending'
                            });
                            container.innerHTML = `
                                <div class="glass-panel" style="padding:40px; text-align:center;">
                                    <ion-icon name="checkmark-circle-outline" style="font-size:5rem; color:#10b981;"></ion-icon>
                                    <h2 style="margin:20px 0;">تم إرسال طلبك!</h2>
                                    <p>جاري مراجعة طلب الاشتراك الخاص بك من قبل الإدارة.</p>
                                    <p style="margin-top:10px; color:var(--text-muted); font-size:0.8rem;">سيتم التواصل معك عبر تيليجرام فور تفعيل الكود.</p>
                                    <button class="btn btn-outline" style="margin-top:30px;" onclick="window.location.reload()">العودة للدخول</button>
                                </div>
                            `;
                        } catch (err) {
                            console.error(err);
                            showNotification('حدث خطأ أثناء الإرسال أو الرفع', 'error');
                            e.target.disabled = false;
                            e.target.textContent = 'إرسال بيانات التحويل (تأكيد)';
                        }
                    }
                }, 'إرسال بيانات التحويل (تأكيد)')
            )
        );
        container.append(pageContent);
    };

    const container = elt('div', { className: 'login-container page-transition' });
    renderLoginForm();
    return container;
};
