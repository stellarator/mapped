// Default icon width/height at DPR: 1
const DEFAULT_ICON_DIMENSION = 20;
export const TOOLBAR_HEIGHT = 40;

export interface Icon {
  id: string;
  svg: string;
  name: string;
  lcName: string;
}
export interface IconSet {
  data: {
    id: number;
    name: string;
    string: string;
  }[];
}

// const svgToDataUrl = (svgString: string) =>
//   `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString).replace(/'/g, '%27').replace(/"/g, '%22')}`;
// const svgToDataUrl = (svgString: string) =>
//   `data:image/svg+xml;charset=utf-8,${svgString.replace(/#/g, '%23')}`;
const svgToDataUrl = (svgString: string) =>
  `data:image/svg+xml;base64,${btoa(svgString)}`;

export const getImageId =
  (icon: Icon, width: number, height: number, scale: number) => `${icon.id}#${width}/${height}@${scale}`;

export const getIconMeta = (icon: Icon, scale: number, len = Math.round(DEFAULT_ICON_DIMENSION * scale)) =>
  ({ scale, width: len, height: len, id: getImageId(icon, len, len, scale) });

export function getIconImage(
  icon: Icon,
  width: number,
  height: number,
  scale: number,
): Promise<HTMLImageElement | ImageData> {
  return new Promise((resolve, reject) => {
    if (!icon.svg) {
      const editFrame = getEditFrame(width, height, scale);
      if (editFrame) resolve(editFrame); else reject();
      return;
    }

    width = Math.floor(width * scale);
    height = Math.floor(height * scale);

    const image = new Image(width, height);

    image.onerror = reject;
    image.onload = () => { resolve(image) };
    image.src = svgToDataUrl(getIconSvg(icon, width, height));
  });
}

export function getEditFrame(width: number, height: number, scale: number): ImageData | undefined {
  const canvas = document.createElement('canvas');

  width = Math.floor(width * scale);
  height = Math.floor(height * scale);

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'rgba(32, 0, 0, 0.05)';
    ctx.beginPath();
    ctx.rect(0, 0, width, height); // ctx.roundRect(0, 0, width, height, ...);
    ctx.fill();
    ctx.stroke();

    return ctx.getImageData(0, 0, width, height);
  }
}

const template = document.createElement('template');

function getIconSvg(icon: Icon, width: number, height: number): string {
  template.innerHTML = icon.svg;

  const svgElement = template.content.firstElementChild as SVGElement;

  svgElement.setAttribute('width', `${width}`);
  svgElement.setAttribute('height', `${height}`);

  return new XMLSerializer().serializeToString(svgElement);
}

const sleep = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

// This function simulates a network fetch request by returning icon set data after some delay
export async function loadIconSet(setId: string): Promise<[string, IconSet]> {
  await sleep(1000 + Math.random() * 1000);
  return [setId, await import(`./components/icons/${setId}.json`)];
}

export function parseIconSet(setId: string, iconSet: IconSet): Icon[] {
  return iconSet.data.map(({ id, name, string: data }) => {
    template.innerHTML = data.replace(/[\t\n\r]/g ,'').trim();

    const svgElement = template.content.firstElementChild as SVGElement;
    const svg = new XMLSerializer().serializeToString(svgElement);

    return { id: `${setId}-${id}`, svg, name, lcName: name.toLowerCase() };
  });
}

export function saveImage(canvas: HTMLCanvasElement, width: number, height: number, type = 'image/png', ratio: number) {
  if (!canvas) return;

  if (width < canvas.width || height < canvas.height || ratio !== 1) {
    const frame = document.createElement('canvas');
    frame.width = ratio > 1 ? width / ratio : width;
    frame.height = ratio < 1 ? height * ratio : height;
    const ctx = frame.getContext('2d');
    if (ctx) {
      const sx = Math.floor((canvas.width - width) / 2);
      const sy = Math.floor((canvas.height - height) / 2);
      ctx.drawImage(canvas, sx, sy, width, height, 0, 0, frame.width, frame.height);
      canvas = frame;
    }
  }

  canvas.toBlob(blob => {
    if (blob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `map@${width}x${height}.${type.split('/')[1]}`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }, type);

  // const imageUrl = canvas.toDataURL('image/png');
  // const link = document.createElement('a');
  // link.href = imageUrl;
  // link.download = filename;
  // link.click();
}

export function debounce(func: (...args: unknown[]) => void, wait = 500) {
  let timeout: number;

  return (...args: unknown[]) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
