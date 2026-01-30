// Utils.js - Helper Functions (Optimized for Supabase)
(function () {
    window.Utils = {
        elt: function (type, props, ...children) {
            const dom = document.createElement(type);
            if (props) {
                for (const key in props) {
                    if (key.startsWith('on') && typeof props[key] === 'function') {
                        dom.addEventListener(key.substring(2).toLowerCase(), props[key]);
                    } else {
                        dom[key] = props[key];
                    }
                }
            }

            const addChildren = (target, kids) => {
                for (const child of kids) {
                    if (child === null || child === undefined || child === false) continue;
                    if (Array.isArray(child)) {
                        addChildren(target, child);
                    } else if (typeof child !== "string") {
                        target.appendChild(child);
                    } else {
                        target.appendChild(document.createTextNode(child));
                    }
                }
            };

            addChildren(dom, children);
            return dom;
        },

        showNotification: function (message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `glass-panel page-transition`;
            toast.style.cssText = `
                position: fixed; top: 20px; right: 20px; padding: 15px 25px;
                z-index: 10000; border-right: 5px solid ${type === 'success' ? '#10b981' : '#ef4444'};
                color: white; min-width: 250px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                direction: rtl; font-family: 'Tajawal', sans-serif;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        },

        formatDate: function (dateStr) {
            if (!dateStr) return '---';
            const date = new Date(dateStr);
            return date.toLocaleDateString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        }
    };
})();
