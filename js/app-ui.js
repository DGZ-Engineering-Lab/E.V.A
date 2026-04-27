document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // Live Clock (Colombia Time)
    function updateClock() {
        const el = document.getElementById('sysClock');
        if (el) {
            el.textContent = new Intl.DateTimeFormat('es-CO', {
                timeZone: 'America/Bogota',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(new Date());
        }
    }
    setInterval(updateClock, 1000);
    updateClock();
    // Remove preloader after window load
    window.addEventListener('load', () => {
        const preloader = document.getElementById('eva-preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => preloader.remove(), 800);
        }
    });
});
