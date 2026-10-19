let instance = 0;

// Accordion title = any heading (H1-H6) or a bold-only paragraph
const isTitle = (el) => /^H[1-6]$/.test(el.tagName)
  || (el.tagName === 'P'
    && el.children.length === 1
    && el.firstElementChild.tagName === 'STRONG'
    && el.textContent.trim() === el.firstElementChild.textContent.trim());

/**
 * Media + Accordion
 * Cell 1: image. Cell 2: accordion.
 * In the accordion cell every heading starts an item and the content
 * that follows it (until the next heading) is the panel.
 */
export default function decorate(block) {
  console.log('media-accordion decorate running', block.outerHTML);
  let cells = [...block.querySelectorAll(':scope > div > div')];
  if (!cells.length) cells = [...block.children];

  const mediaCell = cells.find((cell) => cell.querySelector('picture, img'));
  if (!mediaCell) {
    // eslint-disable-next-line no-console
    console.warn('media-accordion: no image found in block', block);
    return;
  }

  const otherCells = cells.filter((cell) => cell !== mediaCell);
  const mediaFirst = otherCells.length === 0
    || cells.indexOf(mediaCell) < cells.indexOf(otherCells[0]);

  const media = document.createElement('div');
  media.className = 'media-accordion-media';
  const strayText = [];
  [...mediaCell.children].forEach((el) => {
    if (el.matches('picture, img') || el.querySelector('picture, img')) media.append(el);
    else strayText.push(el);
  });

  const elements = [
    ...(mediaFirst ? [] : strayText),
    ...otherCells.flatMap((cell) => [...cell.children]),
    ...(mediaFirst ? strayText : []),
  ];

  const accordion = document.createElement('div');
  accordion.className = 'media-accordion-items';
  instance += 1;

  const pre = [];
  let panel = null;
  elements.forEach((el) => {
    if (isTitle(el)) {
      const details = document.createElement('details');
      details.className = 'media-accordion-item';
      details.name = `media-accordion-${instance}`;

      const summary = document.createElement('summary');
      summary.className = 'media-accordion-label';
      const label = document.createElement('span');
      label.className = 'media-accordion-title';
      label.textContent = el.textContent.trim();
      summary.append(label);

      panel = document.createElement('div');
      panel.className = 'media-accordion-panel';
      details.append(summary, panel);
      accordion.append(details);
    } else if (panel) {
      panel.append(el);
    } else {
      // Content before the first heading stays visible above the accordion
      pre.push(el);
    }
  });

  const content = document.createElement('div');
  content.className = 'media-accordion-content';

  // Wrap intro content so the .media-accordion-intro CSS applies
  if (pre.length) {
    const intro = document.createElement('div');
    intro.className = 'media-accordion-intro';
    intro.append(...pre);
    content.append(intro);
  }

  // Only add the accordion if at least one title was found
  if (accordion.children.length) content.append(accordion);

  block.replaceChildren(...(mediaFirst ? [media, content] : [content, media]));
}
