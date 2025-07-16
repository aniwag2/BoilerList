// client/src/functions/cropImage.js
// Helper function to get the cropped image blob from a given image source and crop area.

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // Needed for cross-origin images
        image.src = url;
    });

/**
 * This function was adapted from `react-easy-crop`'s example:
 * https://github.com/ricardo-ch/react-easy-crop/blob/main/example/src/utils/cropImage.js
 *
 * @param {string} imageSrc - The image src (base64 or URL)
 * @param {Object} pixelCrop - Pixel values for the crop area {x, y, width, height}
 * @returns {Promise<Blob>} - A promise that resolves with the cropped and compressed image Blob.
 */
async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context available');
    }

    const { width: imageWidth, height: imageHeight } = image;
    const { x: cropX, y: cropY, width: cropWidth, height: cropHeight } = pixelCrop;

    // Set canvas size to the cropped area dimensions
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Draw the cropped portion of the image onto the canvas
    ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
    );

    // Compress the image. Adjust 'quality' (0 to 1) for desired compression.
    // 'type' can be 'image/jpeg' or 'image/png'. JPEG is usually better for photos.
    // We target a specific display size, e.g., 800px wide, and keep aspect ratio for visual uniformity
    const MAX_WIDTH = 800; // Example max width for listings display
    const MAX_HEIGHT = 450; // Example max height if aspect ratio is 16:9 (800 * 9/16 = 450)
    let newWidth = canvas.width;
    let newHeight = canvas.height;

    if (newWidth > MAX_WIDTH) {
        newHeight = Math.round(newHeight * (MAX_WIDTH / newWidth));
        newWidth = MAX_WIDTH;
    }
    if (newHeight > MAX_HEIGHT) { // Re-check height if it still exceeds max after width scale
        newWidth = Math.round(newWidth * (MAX_HEIGHT / newHeight));
        newHeight = MAX_HEIGHT;
    }

    // Create a new canvas for resizing
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;
    const resizedCtx = resizedCanvas.getContext('2d');
    if (!resizedCtx) {
        throw new Error('No 2d context available for resizing');
    }
    resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

    // Return the image as a Blob, compressed
    return new Promise((resolve) => {
        resizedCanvas.toBlob((blob) => {
            if (!blob) {
                console.error('Canvas to Blob failed');
                return;
            }
            resolve(blob);
        }, 'image/jpeg', 0.8); // 0.8 is JPEG quality (80%). Adjust as needed.
    });
}

export default getCroppedImg;