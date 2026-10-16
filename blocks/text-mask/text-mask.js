export default function decorate(block) {
  const img = block.querySelector('img');
  const textEl = block.querySelector('h1, h2, h3, h4');
  if (!img || !textEl) return;

  const heading = document.createElement(textEl.tagName);
  heading.className = 'text-mask-text';
  heading.textContent = textEl.textContent;
  heading.style.backgroundImage = `url('${img.src}')`;

  block.replaceChildren(heading);
}
