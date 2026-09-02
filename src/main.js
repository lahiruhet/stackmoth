/* StackMoth: minimal progressive enhancement.
   The page is fully usable without this script. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Pointer-responsive light: only on precise pointers, never with reduced motion */
const finePointer = window.matchMedia('(pointer: fine)');
if (finePointer.matches && !reduceMotion.matches) {
  let frame = null;
  let px = 0;
  let py = 0;

  const apply = () => {
    frame = null;
    document.documentElement.style.setProperty('--mx', `${px}px`);
    document.documentElement.style.setProperty('--my', `${py}px`);
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      px = event.clientX;
      py = event.clientY;
      if (frame === null) frame = requestAnimationFrame(apply);
    },
    { passive: true }
  );
}

/* Scroll reveal */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length > 0 && 'IntersectionObserver' in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* Footer year */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
