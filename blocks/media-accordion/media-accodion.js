let instance = 0;

const isHeading = (el) => /^H[1-6]$/.test(el.tagName);

// A paragraph that contains only bold text, e.g. **Shipping details**
const isBoldLine = (el) => el.tagName === 'P'
  && el.children.length === 1
  && el.firstElementChild.tagName === 'STRONG'
  && el.textContent.trim() === el.firstElementChild.textContent.trim();

/**
 * Decide which elements in the text cell are accordion titles.
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
  // Support both <div><div>img</div><div>text</div></div> and flat cells
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];
  if (cells.length < 2) return;

  const mediaCell = cells.find((cell) => cell.querySelector('picture, img'));
  const contentCell = cells.find((cell) => cell !== mediaCell);
  if (!mediaCell || !contentCell) return;
  const mediaFirst = cells.indexOf(mediaCell) === 0;

  const media = document.createElement('div');
  media.className = 'media-accordion-media';
  media.append(...mediaCell.childNodes);

  const children = [...contentCell.children];
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
