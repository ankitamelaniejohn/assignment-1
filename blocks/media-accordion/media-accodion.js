let instance = 0;

/**
 * Media + Accordion block
 * Authoring: one row, two cells (image cell and text cell, in either order).
 * In the text cell, everything before the first H3 is intro content.
 * Each H3 starts an accordion item; the content after it is the panel.
 * @param {Element} block
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];
  const mediaCell = cells.find((cell) => cell.querySelector('picture, img'));
  const contentCell = cells.find((cell) => cell !== mediaCell);
  if (!mediaCell || !contentCell) return;

  const mediaIndex = cells.indexOf(mediaCell);

  // Media column
  const media = document.createElement('div');
  media.className = 'media-accordion-media';
  media.append(...mediaCell.childNodes);

  // Content column: split into intro + accordion items
  const intro = document.createElement('div');
  intro.className = 'media-accordion-intro';
  const items = [];
  let current = null;

  [...contentCell.children].forEach((el) => {
    if (el.tagName === 'H3') {
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
      // Same name = browser keeps only one item open at a time
      details.name = `media-accordion-${instance}`;

      const summary = document.createElement('summary');
      summary.className = 'media-accordion-label';
      summary.append(title);

      const body = document.createElement('div');
      body.className = 'media-accordion-panel';
      body.append(...panel);

      details.append(summary, body);
      accordion.append(details);
    });

    content.append(accordion);
  }

  // Keep authored column order (image first or second)
  block.replaceChildren(...(mediaIndex === 0 ? [media, content] : [content, media]));
}
