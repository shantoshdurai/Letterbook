// Renders a 1080×1920 Instagram Story image for a logged book, in the spirit of
// Letterboxd's "Share to Instagram Stories" card: the cover front and centre on a
// gradient pulled from the cover's own colours, the rating in stars, and the logo.
import { Book, Review, UserProfile } from '../types';

export type StoryTheme = 'poster' | 'review' | 'minimal';

export interface StoryCardOptions {
  book: Book;
  review?: Review | null;
  profile?: UserProfile;
  theme: StoryTheme;
  includeReviewText: boolean;
}

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

const GREEN = '#15E558';
const ORANGE = '#FF8000';
const BLUE = '#40BCF4';
const INK = '#14181c';

const SANS = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

// Images must be CORS-enabled or the canvas becomes tainted and can't be exported.
// On failure we resolve null and draw a placeholder instead.
function loadImage(src?: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  const cached = imageCache.get(src);
  if (cached) return cached;
  const p = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  imageCache.set(src, p);
  return p;
}

async function ensureFonts() {
  if (!('fonts' in document)) return;
  try {
    await Promise.all([
      document.fonts.load(`700 64px ${SERIF}`),
      document.fonts.load(`italic 400 40px ${SERIF}`),
      document.fonts.load(`500 36px ${SANS}`),
      document.fonts.load(`800 36px ${SANS}`),
      document.fonts.load(`500 28px ${MONO}`),
    ]);
  } catch {
    // Fall back to system fonts.
  }
}

// ---------- colour helpers ----------

type RGB = [number, number, number];

function toCss([r, g, b]: RGB, a = 1) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// Average the top and bottom bands of the cover, then pull them toward the app's ink
// colour so white text always stays legible.
function coverPalette(img: HTMLImageElement | null): { top: RGB; bottom: RGB } {
  const fallback = { top: [36, 52, 71] as RGB, bottom: [16, 20, 26] as RGB };
  if (!img) return fallback;
  try {
    const c = document.createElement('canvas');
    c.width = 6;
    c.height = 9;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return fallback;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    const band = (fromRow: number, toRow: number): RGB => {
      let r = 0, g = 0, b = 0, n = 0;
      for (let y = fromRow; y < toRow; y++) {
        for (let x = 0; x < c.width; x++) {
          const i = (y * c.width + x) * 4;
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
        }
      }
      return [r / n, g / n, b / n];
    };
    const ink: RGB = [20, 24, 28];
    return {
      top: mix(band(0, 3), ink, 0.45),
      bottom: mix(band(6, 9), ink, 0.75),
    };
  } catch {
    return fallback;
  }
}

// ---------- drawing helpers ----------

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// object-fit: cover
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// Cheap, cross-browser blur (ctx.filter isn't supported in every Safari): shrink hard, scale back up.
function drawBlurred(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, factor = 28) {
  const small = document.createElement('canvas');
  small.width = Math.max(1, Math.round(w / factor));
  small.height = Math.max(1, Math.round(h / factor));
  const sctx = small.getContext('2d');
  if (!sctx) return;
  sctx.imageSmoothingQuality = 'high';
  drawCover(sctx, img, 0, 0, small.width, small.height);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(small, x, y, w, h);
  ctx.restore();
}

function drawPoster(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, book: Book, x: number, y: number, w: number, h: number, radius: number) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 30;
  roundRectPath(ctx, x, y, w, h, radius);
  ctx.fillStyle = '#1b2530';
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRectPath(ctx, x, y, w, h, radius);
  ctx.clip();
  if (img) {
    drawCover(ctx, img, x, y, w, h);
  } else {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#243447');
    g.addColorStop(1, '#101820');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(w / 9)}px ${SERIF}`;
    wrapText(ctx, book.title, x + w / 2, y + h / 2 - w / 6, w * 0.8, w / 7.5, 4);
  }
  // Thin inner border, like a physical book edge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 3;
  roundRectPath(ctx, x + 1.5, y + 1.5, w - 3, h - 3, radius);
  ctx.stroke();
  ctx.restore();
}

function starPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, outer: number) {
  const inner = outer * 0.5;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + r * Math.cos(a);
    const py = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.9);
  ctx.bezierCurveTo(cx - s * 1.6, cy - s * 0.1, cx - s * 0.9, cy - s * 1.35, cx, cy - s * 0.55);
  ctx.bezierCurveTo(cx + s * 0.9, cy - s * 1.35, cx + s * 1.6, cy - s * 0.1, cx, cy + s * 0.9);
  ctx.closePath();
}

// Letterboxd-style: only the earned stars are drawn (★★★½), not empty outlines.
// Returns the drawn width so callers can centre or append to it.
function measureRating(rating: number, size: number, liked: boolean) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const count = full + (half ? 1 : 0);
  const gap = size * 0.18;
  let width = count * size + Math.max(0, count - 1) * gap;
  if (half) width -= size / 2; // half star only occupies its left side
  if (liked) width += size * 0.55 + size * 0.9;
  return width;
}

function drawRating(ctx: CanvasRenderingContext2D, rating: number, liked: boolean, x: number, cy: number, size: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const gap = size * 0.18;
  let cursor = x;
  ctx.save();
  ctx.fillStyle = GREEN;
  for (let i = 0; i < full; i++) {
    starPath(ctx, cursor + size / 2, cy, size / 2);
    ctx.fill();
    cursor += size + gap;
  }
  if (half) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(cursor, cy - size, size / 2, size * 2);
    ctx.clip();
    starPath(ctx, cursor + size / 2, cy, size / 2);
    ctx.fill();
    ctx.restore();
    cursor += size / 2;
  } else if (full > 0) {
    cursor -= gap;
  }
  if (liked) {
    cursor += size * 0.55;
    ctx.fillStyle = ORANGE;
    heartPath(ctx, cursor + size * 0.45, cy + size * 0.02, size * 0.9);
    ctx.fill();
  }
  ctx.restore();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
      continue;
    }
    lines.push(line);
    line = words[i];
    if (lines.length === maxLines) {
      line = '';
      break;
    }
  }
  if (line) lines.push(line);
  const out = lines.slice(0, maxLines);
  const truncated = out.join(' ').length < words.join(' ').length;
  if (truncated && out.length) {
    let last = out[out.length - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    out[out.length - 1] = `${last.replace(/[\s,.;:]+$/, '')}…`;
  }
  return out;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const lines = wrapLines(ctx, text, maxWidth, maxLines);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length * lineHeight;
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: string, family: string, maxSize: number, minSize: number, maxWidth: number) {
  let size = maxSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

// Mirrors the BrandMark SVG (48×48 viewBox): three book spines, the last one leaning.
function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size / 48;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.translate(-3.4, 0.9);
  const spine = (rx: number, ry: number, w: number, h: number, fill: string) => {
    roundRectPath(ctx, rx, ry, w, h, 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.fillStyle = 'rgba(20, 24, 28, 0.35)';
    ctx.fillRect(rx, ry + 4, w, 2.2);
  };
  spine(9, 13, 8, 25, ORANGE);
  spine(19, 8, 8, 30, GREEN);
  ctx.translate(36.5, 38);
  ctx.rotate((20 * Math.PI) / 180);
  ctx.translate(-36.5, -38);
  spine(29, 12, 8, 26, BLUE);
  ctx.restore();
}

function drawLogo(ctx: CanvasRenderingContext2D, centerX: number, cy: number, iconSize: number) {
  ctx.save();
  ctx.font = `800 ${Math.round(iconSize * 0.62)}px ${SANS}`;
  ctx.textBaseline = 'middle';
  const word = 'Letterbook';
  const textW = ctx.measureText(word).width;
  const gap = iconSize * 0.12;
  const total = iconSize + gap + textW;
  const x = centerX - total / 2;
  drawMark(ctx, x, cy - iconSize / 2, iconSize);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(word, x + iconSize + gap, cy + 2);
  ctx.restore();
}

function handleOf(profile?: UserProfile, review?: Review | null) {
  const raw = review?.userHandle || profile?.handle || '@reader';
  return raw.startsWith('@') ? raw : `@${raw}`;
}

// ---------- themes ----------

function renderPoster(ctx: CanvasRenderingContext2D, o: StoryCardOptions, cover: HTMLImageElement | null) {
  const { book, review, profile } = o;
  const W = STORY_WIDTH;
  const H = STORY_HEIGHT;
  const { top, bottom } = coverPalette(cover);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, toCss(top));
  bg.addColorStop(1, toCss(bottom));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft glow of the cover behind the poster
  if (cover) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    drawBlurred(ctx, cover, 0, 0, W, H, 40);
    ctx.restore();
    const fade = ctx.createLinearGradient(0, 0, 0, H);
    fade.addColorStop(0, toCss(top, 0.2));
    fade.addColorStop(0.55, toCss(bottom, 0.35));
    fade.addColorStop(1, toCss(bottom, 1));
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H);
  }

  const posterW = 600;
  const posterH = 900;
  const posterX = (W - posterW) / 2;
  const posterY = 250;
  drawPoster(ctx, cover, book, posterX, posterY, posterW, posterH, 22);

  const rating = review?.rating || 0;
  const liked = Boolean(review?.liked);
  const starSize = 88;
  const ratingW = measureRating(rating, starSize, liked);
  drawRating(ctx, rating, liked, (W - ratingW) / 2, posterY + posterH + 120, starSize);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  const titleSize = fitFont(ctx, book.title, '700', SERIF, 76, 48, W - 160);
  let y = posterY + posterH + 260;
  y += wrapText(ctx, book.title, W / 2, y, W - 160, titleSize * 1.15, 2) - titleSize * 1.15;

  ctx.font = `500 38px ${SANS}`;
  ctx.fillStyle = 'rgba(224, 230, 237, 0.75)';
  ctx.fillText(`${book.author} · ${book.year}`, W / 2, y + 64);

  if (o.includeReviewText && review?.content && !review.hasSpoilers) {
    ctx.font = `italic 400 40px ${SERIF}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    wrapText(ctx, `“${review.content}”`, W / 2, y + 150, W - 200, 54, 2);
  }

  ctx.font = `500 30px ${MONO}`;
  ctx.fillStyle = 'rgba(224, 230, 237, 0.6)';
  ctx.fillText(`${review ? 'read by' : 'recommended by'} ${handleOf(profile, review)}`, W / 2, H - 200);
  drawLogo(ctx, W / 2, H - 120, 64);
}

function renderReview(ctx: CanvasRenderingContext2D, o: StoryCardOptions, cover: HTMLImageElement | null, backdrop: HTMLImageElement | null) {
  const { book, review, profile } = o;
  const W = STORY_WIDTH;
  const H = STORY_HEIGHT;

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  // Backdrop across the top, fading into the page like a Letterboxd film page
  const hero = backdrop || cover;
  const heroH = 1000;
  if (hero) {
    ctx.save();
    drawCover(ctx, hero, 0, 0, W, heroH);
    ctx.restore();
    const fade = ctx.createLinearGradient(0, 0, 0, heroH);
    fade.addColorStop(0, 'rgba(20, 24, 28, 0.35)');
    fade.addColorStop(0.55, 'rgba(20, 24, 28, 0.55)');
    fade.addColorStop(1, 'rgba(20, 24, 28, 1)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, heroH);
    const side = ctx.createLinearGradient(0, 0, W, 0);
    side.addColorStop(0, 'rgba(20, 24, 28, 0.5)');
    side.addColorStop(0.2, 'rgba(20, 24, 28, 0)');
    side.addColorStop(0.8, 'rgba(20, 24, 28, 0)');
    side.addColorStop(1, 'rgba(20, 24, 28, 0.5)');
    ctx.fillStyle = side;
    ctx.fillRect(0, 0, W, heroH);
  }

  drawLogo(ctx, W / 2, 150, 60);

  const pad = 90;
  const posterW = 330;
  const posterH = 495;
  const posterY = 700;
  drawPoster(ctx, cover, book, pad, posterY, posterW, posterH, 16);

  const textX = pad + posterW + 56;
  const textW = W - textX - pad;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  const titleSize = fitFont(ctx, book.title, '700', SERIF, 66, 44, textW * 1.6);
  const titleH = wrapText(ctx, book.title, textX, posterY + 150, textW, titleSize * 1.12, 3);
  let y = posterY + 150 + titleH - titleSize * 1.12;

  ctx.font = `500 34px ${SANS}`;
  ctx.fillStyle = 'rgba(224, 230, 237, 0.7)';
  ctx.fillText(String(book.year), textX, y + 62);
  ctx.fillText(book.author, textX, y + 110);

  const rating = review?.rating || 0;
  drawRating(ctx, rating, Boolean(review?.liked), textX, y + 200, 64);

  // Review body
  y = posterY + posterH + 120;
  const showText = o.includeReviewText && review?.content;
  if (showText && review?.hasSpoilers) {
    ctx.font = `600 34px ${SANS}`;
    ctx.fillStyle = ORANGE;
    ctx.fillText('This review may contain spoilers.', pad, y);
  } else if (showText && review) {
    const lineH = 44 * 1.45;
    ctx.font = `italic 400 44px ${SERIF}`;
    const lines = wrapLines(ctx, review.content, W - pad * 2 - 40, 6);
    ctx.fillStyle = GREEN;
    ctx.fillRect(pad, y - 44, 6, lines.length * lineH - 10);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    lines.forEach((l, i) => ctx.fillText(l, pad + 40, y + i * lineH));
  }

  ctx.font = `500 30px ${MONO}`;
  ctx.fillStyle = 'rgba(224, 230, 237, 0.55)';
  ctx.textAlign = 'center';
  ctx.fillText(`${review?.content ? 'Review by' : review ? 'Read by' : 'Recommended by'} ${handleOf(profile, review)}`, W / 2, H - 120);
}

function renderMinimal(ctx: CanvasRenderingContext2D, o: StoryCardOptions, cover: HTMLImageElement | null) {
  const { book, review, profile } = o;
  const W = STORY_WIDTH;
  const H = STORY_HEIGHT;

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  ctx.font = `500 30px ${MONO}`;
  ctx.fillStyle = 'rgba(224, 230, 237, 0.55)';
  ctx.textAlign = 'center';
  ctx.fillText(review ? 'JUST FINISHED' : 'ON MY SHELF', W / 2, 280);

  const posterW = 480;
  const posterH = 720;
  drawPoster(ctx, cover, book, (W - posterW) / 2, 360, posterW, posterH, 18);

  ctx.fillStyle = '#ffffff';
  const titleSize = fitFont(ctx, book.title, '700', SERIF, 70, 46, W - 180);
  let y = 1210;
  y += wrapText(ctx, book.title, W / 2, y, W - 180, titleSize * 1.15, 2) - titleSize * 1.15;
  ctx.font = `500 36px ${SANS}`;
  ctx.fillStyle = 'rgba(224, 230, 237, 0.7)';
  ctx.fillText(book.author, W / 2, y + 62);

  const rating = review?.rating || 0;
  const liked = Boolean(review?.liked);
  const ratingW = measureRating(rating, 70, liked);
  drawRating(ctx, rating, liked, (W - ratingW) / 2, y + 170, 70);

  if (o.includeReviewText && review?.content && !review.hasSpoilers) {
    ctx.font = `italic 400 38px ${SERIF}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    wrapText(ctx, `“${review.content}”`, W / 2, y + 290, W - 220, 52, 3);
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 140, H - 250);
  ctx.lineTo(W / 2 + 140, H - 250);
  ctx.stroke();

  ctx.font = `500 30px ${MONO}`;
  ctx.fillStyle = 'rgba(224, 230, 237, 0.55)';
  ctx.fillText(handleOf(profile, review), W / 2, H - 190);
  drawLogo(ctx, W / 2, H - 110, 56);
}

export async function renderStoryCard(canvas: HTMLCanvasElement, o: StoryCardOptions) {
  const [cover, backdrop] = await Promise.all([
    loadImage(o.book.coverImage),
    o.theme === 'review' ? loadImage(o.book.backdropImage) : Promise.resolve(null),
    ensureFonts(),
  ]);
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not supported');
  ctx.clearRect(0, 0, STORY_WIDTH, STORY_HEIGHT);
  ctx.imageSmoothingQuality = 'high';

  if (o.theme === 'review') renderReview(ctx, o, cover, backdrop);
  else if (o.theme === 'minimal') renderMinimal(ctx, o, cover);
  else renderPoster(ctx, o, cover);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not export image'))), 'image/png');
  });
}

export function storyFileName(book: Book) {
  const slug = book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `letterbook-${slug || 'story'}.png`;
}
