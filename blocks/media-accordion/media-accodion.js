let instance = 0;

const isHeading = (el) => /^H[1-6]$/.test(el.tagName);

// A paragraph that contains only bold text, e.g. **Shipping details**
const isBoldLine = (el) => el.tagName === 'P'
  && el.children.length === 1
  && el.firstElementChild.tagName === 'STRONG'
  && el.textContent.trim() === el.firstElementChild.textContent.trim();

/**
 * Which elements are accordion titles?
 * 1. H3 (preferred)
 * 2. otherwise any heading after the first one (first = intro heading)
 * 3. otherwise bold-only paragraphs
 */
function getTitleTest(children) {
  if (children.some((el) => el.tagName === 'H3')) return (el) => el.tagName === 'H3';
  const headings = children.filter(isHeading);
  if (headings.length > 1) return (el) => isHeading(el) && el !== headings[0];
  if (children.some(isBoldLine)) return isBoldLine;
  return () => false;
}

export default function decorate(block) {
  // Works whether authored as 1 row x 2 cells, 2 rows x 1 cell, or anything similar
  let cells = [...block.querySelectorAll(':scope > div > div')];
  if (!cells.length) cells = [...block.children];

  const mediaCell = cells.find((cell) => cell.querySelector('picture, img'));
  if (!mediaCell) return;

  const otherCells = cells.filter((cell) => cell !== mediaCell);
  const mediaFirst = otherCells.length === 0
    || cells.indexOf(mediaCell) < cells.indexOf(otherCells[0]);

  // Media column: the picture(s). Any text sharing the image cell goes to content.
  const media = document.createElement('div');
  media.className = 'media-accordion-media';
  const textFromMediaCell = [];
  [...mediaCell.children].forEach((el) => {
    if (el.querySelector('picture, img') || el.matches('picture, img')) media.append(el);
    else textFromMediaCell.push(el);
  });

  // Content column: everything that is not the image
  const children = [
    ...(mediaFirst ? [] : textFromMediaCell),
    ...otherCells.flatMap((cell) => [...cell.children]),
    ...(mediaFirst ? textFromMediaCell : []),
  ];
  const isTitle = getTitleTest(children);

  const intro = document.createElement('div');
  intro.className = 'media-accordion-intro';
  const items = [];
  let current = null;

  children.forEach((el) => {
    if (isTitle(el)) {
      current = { title: el, panel: [] };
      items.push(current);
    } else if (current) {
      current.panel.push(el);
    } else {
      intro.append(el);
    }
  });

  const content = document.createElement('div');
  content.className = 'media-accordion-content';
  if (intro.children.length) content.append(intro);

  if (items.length) {
    instance += 1;
    const accordion = document.createElement('div');
    accordion.className = 'media-accordion-items';

    items.forEach(({ title, panel }) => {
      const details = document.createElement('details');
      details.className = 'media-accordion-item';
      details.name = `media-accordion-${instance}`;

      const summary = document.createElement('summary');
      summary.className = 'media-accordion-label';
      const label = document.createElement('span');
      label.className = 'media-accordion-title';
      label.textContent = title.textContent.trim();
      summary.append(label);

      const body = document.createElement('div');
      body.className = 'media-accordion-panel';
      body.append(...panel);

      details.append(summary, body);
      accordion.append(details);
    });

    content.append(accordion);
  }

  block.replaceChildren(...(mediaFirst ? [media, content] : [content, media]));
}
