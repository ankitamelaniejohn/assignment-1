let instance = 0;

/**
 * Media + Accordion block
 * Authoring:
 * | Image | Content |
 *
 * Content:
 * Intro text
 * H3
 * Accordion Content
 * H3
 * Accordion Content
 *
 * @param {Element} block
 */
export default function decorate(block) {
  block.classList.add('media-accordion');

  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];
  if (cells.length < 2) return;

  const mediaCell = cells.find((cell) =>
    cell.querySelector('picture, img'),
  );

  const contentCell = cells.find((cell) => cell !== mediaCell);

  if (!mediaCell || !contentCell) return;

  const mediaIndex = cells.indexOf(mediaCell);

  // Media column
  const media = document.createElement('div');
  media.className = 'media-accordion-media';
  media.append(...mediaCell.childNodes);

  // Content column
  const content = document.createElement('div');
  content.className = 'media-accordion-content';

  const intro = document.createElement('div');
  intro.className = 'media-accordion-intro';

  const accordion = document.createElement('div');
  accordion.className = 'media-accordion-items';

  const elements = [...contentCell.querySelectorAll('h3, p, ul, ol, div')];

  let currentDetails = null;
  let hasAccordion = false;

  elements.forEach((el) => {
    if (el.tagName === 'H3') {
      hasAccordion = true;

      currentDetails = document.createElement('details');
      currentDetails.className = 'media-accordion-item';

      const summary = document.createElement('summary');
      summary.className = 'media-accordion-label';

      const heading = el.cloneNode(true);
      summary.append(heading);

      const panel = document.createElement('div');
      panel.className = 'media-accordion-panel';

      currentDetails.append(summary, panel);
      accordion.append(currentDetails);
    } else if (currentDetails) {
      currentDetails
        .querySelector('.media-accordion-panel')
        .append(el.cloneNode(true));
    } else {
      intro.append(el.cloneNode(true));
    }
  });

  if (intro.childNodes.length) {
    content.append(intro);
  }

  if (hasAccordion) {
    instance += 1;

    accordion
      .querySelectorAll('.media-accordion-item')
      .forEach((item) => {
        item.setAttribute('name', `media-accordion-${instance}`);
      });

    // Open first item by default
    const firstItem = accordion.querySelector('.media-accordion-item');
    if (firstItem) {
      firstItem.open = true;
    }

    content.append(accordion);
  }

  block.replaceChildren(
    ...(mediaIndex === 0 ? [media, content] : [content, media]),
  );
}
