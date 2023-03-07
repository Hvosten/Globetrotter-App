import ColorThief from 'colorthief'

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

const getZoom = (countryArea) => {
    const AREA_OF_WORLD = 510_000_000;
    const MAP_AREA_IN_PIXELS = 256 * 256;

    const countryAreaInPixels = countryArea * MAP_AREA_IN_PIXELS / AREA_OF_WORLD;
    const zoom =  - getBaseLog(2, countryAreaInPixels  / MAP_AREA_IN_PIXELS) / 2;
    return Math.min(10, zoom);
}
  
const getBaseLog = (x, y) => {
    return Math.log(y) / Math.log(x);
}

export {generateRandomInteger, getImgDominantColor, getZoom};