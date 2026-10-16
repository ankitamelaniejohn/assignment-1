export default function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'gallery-tabs-list';
  tablist.setAttribute('role', 'tablist');

  const panels = [];
  const buttons = [];

  [...block.children].forEach((row, i) => {
    const [labelCell, contentCell] = row.children;
    if (!labelCell || !contentCell) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.textContent = labelCell.textContent.trim();

    const panel = document.createElement('div');
    panel.className = 'gallery-tabs-panel';
    panel.setAttribute('role', 'tabpanel');

    const items = [];
    [...contentCell.children].forEach((el) => {
      // text of this element, ignoring any image inside it
      const clone = el.cloneNode(true);
      clone.querySelectorAll('picture, img').forEach((p) => p.remove());
      const txt = clone.textContent.trim();

      const pics = el.matches('picture') ? [el] : [...el.querySelectorAll('picture')];
      if (pics.length) {
        pics.forEach((pic) => {
          items.push({ pic, caption: txt || pic.querySelector('img')?.alt || '' });
        });
      } else if (txt && items.length) {
        items[items.length - 1].caption = txt;
      }
    });

    items.forEach(({ pic, caption }) => {
      const item = document.createElement('div');
      item.className = 'gallery-tabs-item';
      item.tabIndex = 0;
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
