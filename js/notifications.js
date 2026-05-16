/**
 * African Artifacts - Global Notification System
 * Handles Toasts and Popup Dialogs
 */

(function() {
    // 1. Inject CSS
    const css = `
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 100000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        }

        .toast {
            background: #1a1a1a;
            border: 1px solid rgba(201, 169, 98, 0.2);
            border-radius: 12px;
            padding: 1rem 1.5rem;
            min-width: 300px;
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
            transform: translateX(120%);
            animation: toastSlideIn 0.4s ease forwards;
            pointer-events: auto;
            color: #f5f5f5;
            font-family: 'Segoe UI', sans-serif;
        }

        @keyframes toastSlideIn {
            to { transform: translateX(0); }
        }

        .toast.toast-exit {
            animation: toastSlideOut 0.3s ease forwards;
        }

        @keyframes toastSlideOut {
            to { transform: translateX(120%); opacity: 0; }
        }

        .toast-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .toast-icon svg {
            width: 18px;
            height: 18px;
            fill: white;
        }

        .toast.success .toast-icon { background: #22c55e; }
        .toast.error .toast-icon { background: #ef4444; }
        .toast.warning .toast-icon { background: #fbbf24; }
        .toast.info .toast-icon { background: #3b82f6; }

        .toast-content { flex: 1; }
        .toast-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 2px; color: #fff; }
        .toast-message { color: #888; font-size: 0.85rem; }
        .toast-close { background: none; border: none; color: #888; cursor: pointer; font-size: 18px; line-height: 1; transition: color 0.2s; }
        .toast-close:hover { color: #fff; }

        /* Global Popup (Replacement for Modals) */
        .global-popup-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            z-index: 100000;
            display: none;
            justify-content: center;
            align-items: center;
            padding: 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .global-popup-overlay.active {
            display: flex;
            opacity: 1;
        }

        .global-popup {
            background: #141414;
            border: 1px solid rgba(201, 169, 98, 0.3);
            border-radius: 24px;
            padding: 2.5rem;
            width: 100%;
            max-width: 550px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            color: #f5f5f5;
            font-family: 'Segoe UI', sans-serif;
        }

        @media (max-width: 576px) {
            .global-popup {
                padding: 1.5rem;
                border-radius: 16px;
            }
            .global-popup-footer {
                flex-direction: column;
            }
            .popup-btn {
                width: 100%;
            }
            .toast {
                min-width: calc(100vw - 40px);
                max-width: calc(100vw - 40px);
            }
        }

        .global-popup-overlay.active .global-popup {
            transform: scale(1);
        }

        .global-popup-close {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            background: none;
            border: none;
            color: #888;
            font-size: 24px;
            cursor: pointer;
            transition: color 0.2s;
        }

        .global-popup-close:hover { color: #fff; }

        .global-popup-header { margin-bottom: 1.5rem; }
        .global-popup-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .global-popup-subtitle { color: #888; font-size: 0.95rem; }

        .global-popup-footer {
            margin-top: 2rem;
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }

        .popup-btn {
            padding: 0.8rem 1.8rem;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.95rem;
            border: none;
        }

        .popup-btn-primary { background: #c9a962; color: #0a0a0a; }
        .popup-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(201, 169, 98, 0.3); }
        .popup-btn-secondary { background: rgba(255, 255, 255, 0.05); color: #fff; border: 1px solid rgba(255, 255, 255, 0.1); }
        .popup-btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // 2. Inject HTML Containers
    document.addEventListener("DOMContentLoaded", function() {
        if (!document.getElementById('globalToastContainer')) {
            const container = document.createElement('div');
            container.id = 'globalToastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        if (!document.getElementById('globalPopupOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'globalPopupOverlay';
            overlay.className = 'global-popup-overlay';
            overlay.innerHTML = `
                <div class="global-popup">
                    <button class="global-popup-close" onclick="window.hidePopup()">&times;</button>
                    <div class="global-popup-header">
                        <h2 class="global-popup-title" id="globalPopupTitle"></h2>
                        <p class="global-popup-subtitle" id="globalPopupSubtitle"></p>
                    </div>
                    <div id="globalPopupContent"></div>
                    <div class="global-popup-footer" id="globalPopupFooter"></div>
                </div>
            `;
            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) window.hidePopup();
            });
            document.body.appendChild(overlay);
        }
    });

    // 3. Global Functions
    window.showToast = function(title, message, type = 'info', duration = 4000) {
        const container = document.getElementById('globalToastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
            error: '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
            warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
            info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <svg viewBox="0 0 24 24">${icons[type] || icons.info}</svg>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    window.showPopup = function(options) {
        const { title, subtitle, content, footer, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', showCancel = true } = options;
        const overlay = document.getElementById('globalPopupOverlay');
        const titleEl = document.getElementById('globalPopupTitle');
        const subtitleEl = document.getElementById('globalPopupSubtitle');
        const contentEl = document.getElementById('globalPopupContent');
        const footerEl = document.getElementById('globalPopupFooter');

        titleEl.textContent = title || '';
        subtitleEl.textContent = subtitle || '';
        
        if (typeof content === 'string') {
            contentEl.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentEl.innerHTML = '';
            contentEl.appendChild(content);
        }

        footerEl.innerHTML = '';
        if (showCancel) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'popup-btn popup-btn-secondary';
            cancelBtn.textContent = cancelText;
            cancelBtn.onclick = window.hidePopup;
            footerEl.appendChild(cancelBtn);
        }

        if (onConfirm || !showCancel) {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'popup-btn popup-btn-primary';
            confirmBtn.textContent = confirmText;
            confirmBtn.onclick = () => {
                if (onConfirm) onConfirm();
                else window.hidePopup();
            };
            footerEl.appendChild(confirmBtn);
        }

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.hidePopup = function() {
        const overlay = document.getElementById('globalPopupOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    /**
     * Set button loading state
     * @param {HTMLElement} btn - The button element
     * @param {boolean} isLoading - Loading state
     * @param {string} originalHtml - Optional original HTML to restore
     */
    window.setLoading = function(btn, isLoading, originalHtml = null) {
        if (!btn) return;
        
        if (isLoading) {
            if (!btn.dataset.originalHtml) {
                btn.dataset.originalHtml = btn.innerHTML;
            }
            btn.disabled = true;
            btn.classList.add('btn-loading');
            btn.innerHTML = `
                <span class="btn-spinner"></span>
                ${btn.dataset.originalHtml}
            `;
            
            // Add style if not present
            if (!document.getElementById('btnSpinnerStyles')) {
                const s = document.createElement('style');
                s.id = 'btnSpinnerStyles';
                s.innerText = `
                    .btn-loading {
                        position: relative;
                        color: transparent !important;
                        pointer-events: none;
                        transition: all 0.2s;
                    }
                    .btn-spinner {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 18px;
                        height: 18px;
                        margin-top: -9px;
                        margin-left: -9px;
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        border-top-color: #fff;
                        border-radius: 50%;
                        animation: btn-spin 0.6s linear infinite;
                    }
                    @keyframes btn-spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(s);
            }
        } else {
            btn.disabled = false;
            btn.classList.remove('btn-loading');
            if (btn.dataset.originalHtml) {
                btn.innerHTML = btn.dataset.originalHtml;
            } else if (originalHtml) {
                btn.innerHTML = originalHtml;
            }
        }
    };

    // Replace browser alerts with toasts
    const originalAlert = window.alert;
    window.alert = function(message) {
        window.showToast('Notification', message, 'info');
    };
})();
