import {getCountryDataByName, getAllCountries} from './api.js';
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
    const countryIndex = state.retrievedCountriesData.findIndex(countryData => countryData.name.common === countryName);
    if(countryIndex === -1) {
        const countryData = await getCountryDataByName(countryName);
        state.currentCountryData = countryData[0]; 
        state.retrievedCountriesData.push(state.currentCountryData);
        state.currIndex = state.retrievedCountriesData.length - 1;
    } else {
        state.currentCountryData =  state.retrievedCountriesData[countryIndex];
        state.currIndex = countryIndex;
    }
}

export async function initCountries() {
    state.allCountries = await getAllCountries();

    const options = {
      isCaseSensitive: true,
      includeScore: true,
      shouldSort: true,
      findAllMatches: true
    }

    fuse = new Fuse(state.allCountries.map(obj => obj.name), options)
    
    //getRandomCountry();

    //upateHashUrl(countryName);
}

export function generateSimilarCountries() {
    const allSimilarResults = fuse.search(state.currentCountryName);
    state.similarCountryNames = allSimilarResults.slice(0, 5).map(res => res.item);
}

export function getRandomCountry(){
    const index = generateRandomInteger(0, state.allCountries.length - 1);
    const { name } = state.allCountries.splice(index, 1)[0];
    return name;
}

export function getPrevCountryName(){
    if(state.currIndex > 0) {
        return state.retrievedCountriesData[state.currIndex - 1].name.common;
    }
    return null;
}

export function getNextCountryName(){
    if(state.retrievedCountriesData.length > state.currIndex + 1) {
        return state.retrievedCountriesData[state.currIndex + 1].name.common;
    } 
    return getRandomCountry();
}