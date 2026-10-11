const NON_WORD = new RegExp('[^\\p{L}\\p{M}\\p{N}\\s]', 'gu');

export function normalizeKey(name: string): string {
  return name
    .normalize('NFKC')
    .replace(/[\u200c\u200d]/g, '')
    .toLowerCase()
    .replace(NON_WORD, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanPlaceName(raw: string): string | null {
  const name = raw.replace(/\s+/g, ' ').trim();
  if (name.length < 2 || name.length > 60) return null;
  if (/https?:|www\.|@|<|>/i.test(name)) return null;
  if (!normalizeKey(name)) return null;
  return name;
}

export const OSM_REF = /^(node|way|relation)\/\d{1,12}$/;