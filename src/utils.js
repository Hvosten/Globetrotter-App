import ColorThief from '../node_modules/colorthief/dist/color-thief.mjs'

const generateRandomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}).join('')

const imageLoaded = img =>
  new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
});

const getImgDominantColor = async img => {
    const colorThief = new ColorThief();
    if (img.complete) {
        const rgbColor =  colorThief.getColor(img);
        return rgbToHex(...rgbColor);
    } else {
        const loadedImg = await imageLoaded(img);
        const rgbColor =  colorThief.getColor(loadedImg);
        return rgbToHex(...rgbColor);
    }
}

export {generateRandomInteger, getImgDominantColor};