// Lightweight lightbox controller
(function () {
    // Elements
    const polaroids = document.querySelectorAll('.polaroid');
    const lightbox = document.getElementById('lightbox');
    const overlay = document.getElementById('lightboxOverlay');
    const closeBtn = document.getElementById('lightboxClose');
    const lbImg = document.getElementById('lightboxImage');
    const lbCaption = document.getElementById('lightboxCaption');

    // Preload helper returns when image has been loaded (or failed)
    function preload(src) {
        return new Promise((resolve) => {
            const i = new Image();
            i.onload = () => resolve();
            i.onerror = () => resolve();
            i.src = src;
        });
    }

    // Open lightbox and show image/caption
    async function openLightbox(src, caption) {
        // If we're currently running a closing animation, remove the flag so open can proceed
        if (lightbox.classList.contains('closing')) {
            lightbox.classList.remove('closing');
        }

        await preload(src);
        lbImg.src = src;
        lbCaption.textContent = caption || '';
        lightbox.setAttribute('aria-hidden', 'false');
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        closeBtn.focus(); // accessibility: focus the close button
    }

    // Close with a proper transitionend handler reference so it can be removed cleanly
    function closeLightbox() {
        if (!lightbox.classList.contains('open')) return;

        // start closing animation
        lightbox.classList.remove('open');
        lightbox.classList.add('closing');

        const content = lightbox.querySelector('.lightbox-content');

        // Named handler so we can remove it reliably
        function handleTransitionEnd(e) {
            if (e.target !== content) return; // only react to the content's transition
            content.removeEventListener('transitionend', handleTransitionEnd);
            cleanupAfterClose();
        }

        // Fallback in case transitionend doesn't fire
        const fallback = setTimeout(() => {
            content.removeEventListener('transitionend', handleTransitionEnd);
            cleanupAfterClose();
        }, 700);

        // Attach handler
        content.addEventListener('transitionend', handleTransitionEnd);

        // Cleanup function invoked after close transition completes (or fallback)
        function cleanupAfterClose() {
            clearTimeout(fallback);
            lightbox.classList.remove('closing');
            lightbox.setAttribute('aria-hidden', 'true');
            // clear image and caption after the animation so reopening works reliably
            lbImg.src = '';
            lbCaption.textContent = '';
            document.body.style.overflow = '';
        }
    }

    // Attach events to polaroids (click + keyboard)
    polaroids.forEach((p) => {
        const imgEl = p.querySelector('img');
        const full = p.dataset.full || imgEl.src;
        const caption = p.querySelector('figcaption') ? p.querySelector('figcaption').textContent : '';
        p.setAttribute('data-full', full);
        p.addEventListener('click', () => openLightbox(full, caption));
        p.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(full, caption);
            }
        });
    });

    // Close handlers: overlay, button, and Escape
    overlay.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
})();
