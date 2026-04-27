document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // High-Performance Engine
    let mouseX = 0, mouseY = 0;
    let lastFrame = 0;
    const particles = [];

    function initParticles() {
        const container = document.body;
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.className = 'zenith-particle';
            p.style.cssText = `position: absolute; width: 3px; height: 3px; background: var(--primary); border-radius: 50%; opacity: 0.3; pointer-events: none; z-index: -1;`;
            container.appendChild(p);
            particles.push({ 
                el: p, 
                x: Math.random() * 100, 
                y: Math.random() * 100, 
                vx: (Math.random() - 0.5) * 0.1, 
                vy: (Math.random() - 0.5) * 0.1 
            });
        }
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    function update(time) {
        if (time - lastFrame < 16) { 
            requestAnimationFrame(update); 
            return; 
        } // Throttle to 60fps
        lastFrame = time;

        // Update Background Elements
        const grid = document.querySelector('.cyber-grid');
        const bloom = document.querySelector('.zenith-bloom');
        const dx = (mouseX - window.innerWidth / 2) * 0.01;
        const dy = (mouseY - window.innerHeight / 2) * 0.01;

        if (grid) grid.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        if (bloom) bloom.style.transform = `translate3d(${dx * 2}px, ${dy * 2}px, 0)`;

        // Update Particles
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > 100) p.vx *= -1;
            if (p.y < 0 || p.y > 100) p.vy *= -1;

            const pDist = Math.hypot(mouseX - (p.x * window.innerWidth / 100), mouseY - (p.y * window.innerHeight / 100));
            let scale = 1;
            if (pDist < 150) scale = 2 - (pDist / 150);

            p.el.style.transform = `translate3d(${p.x}vw, ${p.y}vh, 0) scale(${scale})`;
        });

        // Magnetic CTA
        const cta = document.querySelector('.cta');
        if (cta) {
            const rect = cta.getBoundingClientRect();
            const cX = rect.left + rect.width / 2;
            const cY = rect.top + rect.height / 2;
            const dist = Math.hypot(mouseX - cX, mouseY - cY);
            if (dist < 200) {
                cta.style.transform = `translate3d(${(mouseX - cX) * 0.2}px, ${(mouseY - cY) * 0.2}px, 0) scale(1.05) rotate(${(mouseX - cX) * 0.01}deg)`;
            } else {
                cta.style.transform = `translate3d(0,0,0)`;
            }
        }

        requestAnimationFrame(update);
    }

    initParticles();
    requestAnimationFrame(update);

    // Typewriter (Isolated)
    const textSnippets = ["Valoración Forestal", "Indexación IPC", "Auditoría Predial", "Peritaje Masivo"];
    let sIdx = 0, charIdx = 0, isDel = false;
    function type() {
        const target = document.getElementById("typewriter");
        if (!target) return;
        const fullText = textSnippets[sIdx];
        target.innerText = isDel ? fullText.substring(0, charIdx--) : fullText.substring(0, charIdx++);
        if (!isDel && charIdx > fullText.length) { 
            isDel = true; 
            setTimeout(type, 2000); 
        } else if (isDel && charIdx < 0) { 
            isDel = false; 
            sIdx = (sIdx + 1) % textSnippets.length; 
            setTimeout(type, 500); 
        } else { 
            setTimeout(type, isDel ? 50 : 100); 
        }
    }
    type();

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('[E.V.A.] SW registered:', reg.scope))
            .catch(err => console.warn('[E.V.A.] SW failed:', err));
    }
});
