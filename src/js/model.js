import {getCountryDataByName, getAllCountriesNames} from './api.js';
import {generateRandomInteger} from './utils.js';
import Fuse from 'fuse.js'

let fuse;

export const state = {
    retrievedCountriesData: [],
    allCountriesNames: [],
    currentCountryName: "",
    currentCountryData: {},
    currIndex:  0,
    similarCountryNames: []
};

export async function getCountryData(countryName) {
    state.currentCountryName = countryName;
    const countryIndex = state.retrievedCountriesData.findIndex(countryData => countryData.commonName === countryName);
    if(countryIndex === -1) {
        const countryData = await getCountryDataByName(countryName);
        state.currentCountryData = createCountryObject(countryData); 
        state.retrievedCountriesData.push(state.currentCountryData);
        state.currIndex = state.retrievedCountriesData.length - 1;
    } else {
        state.currentCountryData =  state.retrievedCountriesData[countryIndex];
        state.currIndex = countryIndex;
    }
}

function createCountryObject(data){
    const countryData = data[0];
    return {
        commonName: countryData.name.common,
        officialName: countryData.name.official,
        codeAlpha2: countryData.cca2,
        codeAlpha3: countryData.cca3,
        currencies: Object.keys(countryData.currencies ?? {}).map(curr => {return {ISOCode: curr, name: countryData.currencies[curr].name, symbol: countryData.currencies[curr].symbol}}),
        capital: countryData.capital,
        spellings: countryData.altSpellings,
        region: countryData.region,
        subregion: countryData.subregion,
        languages: Object.values(countryData.languages ?? {}),
        latlng: countryData.latlng,
        borders: countryData.borders,
        area: countryData.area,
        population: countryData.population,
        flag: countryData.flag,
        flagPicture: countryData.flags.png,
        flagAlt: countryData.flags.alt,
      };
}

export async function initCountries() {
    state.allCountries = await getAllCountriesNames();

    const options = {
      isCaseSensitive: true,
      includeScore: true,
      shouldSort: true,
      findAllMatches: true
    }

    fuse = new Fuse(state.allCountries, options);
}

export function generateSimilarCountries() {
    const allSimilarResults = fuse.search(state.currentCountryName);
    state.similarCountryNames = allSimilarResults.slice(0, 5).map(res => res.item);
}

export function getRandomCountry(){
    const index = generateRandomInteger(0, state.allCountries.length - 1);
    return state.allCountries.splice(index, 1)[0];
}

export function getPrevCountryName(){
    if(state.currIndex > 0) {
        return state.retrievedCountriesData[state.currIndex - 1].commonName;
    }
    return null;
}

export function getNextCountryName(){
    if(state.retrievedCountriesData.length > state.currIndex + 1) {
        return state.retrievedCountriesData[state.currIndex + 1].commonName;
    } 
    return getRandomCountry();
}