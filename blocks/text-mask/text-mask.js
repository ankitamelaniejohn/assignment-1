export default function decorate(block) {
  const rows = [...block.children];

  // 1. Find the image source (image, link, or plain path typed in the cell)
  const img = block.querySelector('img');
  const link = block.querySelector('a');
  let src = img?.currentSrc || img?.src || link?.href;
  if (!src) src = rows[0]?.textContent.trim();
  if (!src) return;

  // 2. Find the text row (the row that is not the image)
  const textRow = rows.find(
    (row) => !row.querySelector('picture, img')
      && row.textContent.trim() !== src,
  );

  // 3. Build the overlay content
  const content = document.createElement('div');
  content.className = 'text-mask-content';
  if (textRow) content.append(...textRow.firstElementChild.childNodes);

  // 4. Set the image as the fixed background of the block
  block.style.backgroundImage = `url('${src}')`;
  block.replaceChildren(content);
}
