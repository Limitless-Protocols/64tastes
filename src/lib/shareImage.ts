import { toPng } from 'html-to-image';

export async function renderPng(node: HTMLElement, width: number, height: number) {
  await document.fonts.ready;
  const options = { width, height, pixelRatio: 1, cacheBust: true };
  await toPng(node, options); // warm-up: Safari often drops fonts on the first pass
  return toPng(node, options);
}