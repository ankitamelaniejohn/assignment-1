import { createOptimizedPicture } from '../../scripts/aem.js';

function animateCounter(el, duration = 2000) {
  const original = el.textContent.trim();

  // Splits "15+" into prefix "", number "15", suffix "+"
  const match = original.match(/^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return;

  const [, prefix, numStr, suffix] = match;
  const target = parseFloat(numStr.replace(/,/g, ''));
  const decimals = (numStr.split('.')[1] || '').length;
  const useCommas = numStr.includes(',');
  const start = 1;

  const format = (n) => {
    const fixed = n.toFixed(decimals);
    return useCommas
      ? Number(fixed).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
      : fixed;
  };

  el.textContent = `${prefix}${format(start)}${suffix}`;

  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - (1 - progress) ** 3; // ease-out
    const value = start + (target - start) * eased;
    el.textContent = `${prefix}${format(progress === 1 ? target : value)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  /* count-up animation for the small variant, starts when scrolled into view */
  if (block.classList.contains('small')) {
    const headings = block.querySelectorAll('h3');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          headings.forEach((h3) => animateCounter(h3));
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(block);
  }
}
