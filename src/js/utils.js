import { TIMEOUT_SEC } from './config.js';
import ColorThief from 'colorthief'
import TimeoutError from './errors/TimeoutError';

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
    if(!img.complete) await imageLoaded(img);

    const rgbColor =  colorThief.getColor(img);
    return rgbToHex(...rgbColor);
}

const getPalette = async img => {
    const colorThief = new ColorThief();
    if(!img.complete) await imageLoaded(img);

    const palette = colorThief.getPalette(img);
    return palette.map(color => rgbToHex(...color));
}

const isColorToBright = (color) => {
    const c = color.substring(1);      // strip #
    const rgb = parseInt(c, 16);   // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff;  // extract red
    const g = (rgb >>  8) & 0xff;  // extract green
    const b = (rgb >>  0) & 0xff;  // extract blue

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    console.log(luma)
    return luma >= 220;
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

const timeout = (sec) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new TimeoutError(`Server is busy right now! Request took more than ${sec} seconds, please try again later.`));
        }, sec * 1000)
    });
}

const getJSON = async (url) => {
    try{
        const response = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
        const data = await response.json();
        if(data.status === 404) throw new Error(`${data.message} (${data.status})`);
        return data;
    } catch(err){
        throw err;
    }
}

const changePropery = (el, prop, value) => {
    el.style.setProperty(prop, value);
}

export {generateRandomInteger, getImgDominantColor, getPalette, getZoom, getJSON, changePropery};