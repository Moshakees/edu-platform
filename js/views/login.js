// Login View
window.LoginView = function () {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;

    const container = elt('div', { className: 'login-container page-transition' },
        elt('div', { className: 'glass-panel', style: 'width: 100%; max-width: 400px; padding: 40px; text-align: center;' },
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
            elt('p', { style: 'margin-top: 20px; color: var(--text-muted); font-size: 0.9rem;' }, 'إذا لم يكن لديك كود، يرجى التواصل مع المسؤول')
        )
    );

    return container;
};
