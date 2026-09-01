export async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const mimeType = file.type || 'image/jpeg';
      try {
        const compressed = await compressAndResizeImage(result, 900, 0.78);
        resolve({
          base64: compressed,
          mimeType: 'image/jpeg',
        });
      } catch {
        resolve({
          base64: result,
          mimeType,
        });
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function dataUrlToBase64(dataUrl: string): { base64: string; mimeType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      base64: match[2],
    };
  }
  // If raw svg data uri
  if (dataUrl.startsWith('data:image/svg+xml')) {
    return {
      mimeType: 'image/svg+xml',
      base64: dataUrl,
    };
  }
  return {
    mimeType: 'image/jpeg',
    base64: dataUrl,
  };
}

export async function compressAndResizeImage(
  dataUrl: string,
  maxDimension = 900,
  quality = 0.78
): Promise<string> {
  // If it's an SVG data URI, don't canvas compress it here, convert with svgDataUrlToPngBase64 instead
  if (dataUrl.startsWith('data:image/svg+xml')) {
    return svgDataUrlToPngBase64(dataUrl, 800, 1000);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}

export async function svgDataUrlToPngBase64(svgDataUrl: string, width = 800, height = 1000): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(svgDataUrl);
      }
    };
    img.onerror = () => {
      resolve(svgDataUrl);
    };
    img.src = svgDataUrl;
  });
}
