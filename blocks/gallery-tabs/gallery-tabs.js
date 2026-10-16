export default function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'gallery-tabs-list';
  tablist.setAttribute('role', 'tablist');

  const panels = [];
  const buttons = [];

  [...block.children].forEach((row, i) => {
    const [labelCell, contentCell] = row.children;
    if (!labelCell || !contentCell) return;

    // Button from the first cell
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.textContent = labelCell.textContent.trim();

    // Panel from the second cell
    const panel = document.createElement('div');
    panel.className = 'gallery-tabs-panel';
    panel.setAttribute('role', 'tabpanel');

    // Pair each image with the text line that follows it
    const items = [];
    [...contentCell.children].forEach((el) => {
      const pic = el.matches('picture') ? el : el.querySelector('picture');
      if (pic) {
        items.push({ pic, caption: pic.querySelector('img')?.alt || '' });
      } else if (el.textContent.trim() && items.length) {
        items[items.length - 1].caption = el.textContent.trim();
      }
    });

    items.forEach(({ pic, caption }) => {
      const item = document.createElement('div');
      item.className = 'gallery-tabs-item';
      item.tabIndex = 0; // lets keyboard and touch users see the text too
      item.append(pic);
      if (caption) {
        const text = document.createElement('div');
        text.className = 'gallery-tabs-caption';
        text.textContent = caption;
        item.append(text);
      }
      panel.append(item);
    });

    button.addEventListener('click', () => {
      buttons.forEach((b, idx) => {
        const active = b === button;
        b.setAttribute('aria-selected', active);
        panels[idx].hidden = !active;
      });
    });

    buttons.push(button);
    panels.push(panel);
    tablist.append(button);
    button.setAttribute('aria-selected', i === 0);
    panel.hidden = i !== 0;
  });

  block.replaceChildren(tablist, ...panels);
}
