/**
 * African Artifacts - Global Cool Preloader
 * Injects preloader HTML and CSS automatically
 */

(function() {
    // 1. Create and inject CSS
    const css = `
        #aa-preloader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #0d0d0d;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999999;
            transition: opacity 0.8s cubic-bezier(0.65, 0, 0.35, 1), visibility 0.8s;
        }

        #aa-preloader.fade-out {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        .preloader-content {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .preloader-circle {
            width: 140px;
            height: 140px;
            border: 2px solid rgba(201, 169, 98, 0.05);
            border-top: 2px solid #c9a962;
            border-radius: 50%;
            animation: spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
            filter: drop-shadow(0 0 10px rgba(201, 169, 98, 0.2));
        }

        .preloader-artifact {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 65px;
            height: 65px;
            color: #c9a962;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse-glow 2s ease-in-out infinite;
        }

        .preloader-text {
            margin-top: 40px;
            color: #c9a962;
            font-family: 'Segoe UI', sans-serif;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 6px;
            text-transform: uppercase;
            opacity: 0;
            animation: fadeInUp 0.8s ease forwards 0.3s;
            text-shadow: 0 0 15px rgba(201, 169, 98, 0.3);
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes pulse-glow {
            0%, 100% { 
                transform: translate(-50%, -50%) scale(0.9); 
                filter: drop-shadow(0 0 5px rgba(201, 169, 98, 0.4));
                opacity: 0.8; 
            }
            50% { 
                transform: translate(-50%, -50%) scale(1.1); 
                filter: drop-shadow(0 0 20px rgba(201, 169, 98, 0.8));
                opacity: 1; 
            }
        }

        @keyframes fadeInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        /* Prevent scrolling while loading */
        body.loading {
            overflow: hidden;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // 2. Create and inject HTML
    const preloaderHtml = `
        <div id="aa-preloader">
            <div class="preloader-content">
                <div class="preloader-circle"></div>
                <div class="preloader-artifact">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                </div>
                <div class="preloader-text">African Artifacts</div>
            </div>
        </div>
    `;

    // Insert as first child of body
    document.addEventListener("DOMContentLoaded", function() {
        if (!document.getElementById('aa-preloader')) {
            document.body.insertAdjacentHTML('afterbegin', preloaderHtml);
            document.body.classList.add('loading');
        }
    });

    // 3. Handle window load to remove preloader
    window.addEventListener("load", function() {
        const preloader = document.getElementById('aa-preloader');
        if (preloader) {
            // Slight delay for smooth feeling
            setTimeout(() => {
                preloader.classList.add('fade-out');
                document.body.classList.remove('loading');
                
                // Remove from DOM after transition
                setTimeout(() => {
                    preloader.remove();
                }, 600);
            }, 800);
        }
    });
})();
