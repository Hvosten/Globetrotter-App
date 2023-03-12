import 'core-js/stable';
import 'regenerator-runtime/runtime';

import Fuse from 'fuse.js'

import countryView from '../views/countryView.js';
import mapView from '../views/mapView.js';
import searchView from '../views/searchView.js'

import {getCountryDataByName, getAllCountries} from './api.js';
import {generateRandomInteger} from './utils.js';

const buttonNext = document.getElementById('next');
const buttonPrevious = document.getElementById('previous');





const retrievedCountriesData = [];
let allCountries = [];
let currIndex = 0;
let fuse;
let currentCountry;

function initApp() {
  mapView.initMap();
  initButtons();
  initCountries();
}

async function initCountries() {
  allCountries = await getAllCountries();
  const options = {
    isCaseSensitive: true,
    includeScore: true,
    shouldSort: true,
    findAllMatches: true
  }
  fuse = new Fuse(allCountries.map(obj => obj.name), options)
  const countryName = getRandomCountry();
  upateHashUrl(countryName);


}

function getRandomCountry(){
  const randomIndex = generateRandomInteger(0, allCountries.length - 1);
  const {name} = allCountries.splice(randomIndex, 1)[0];
  return name;
  
}

function initButtons() {
  buttonNext.addEventListener('click', (e)=>{
    e.preventDefault();
    let nextCountryName;
    if(retrievedCountriesData.length > currIndex + 1) {
      nextCountryName = retrievedCountriesData[currIndex + 1].name.common;
    } else {
      nextCountryName = getRandomCountry();
    }
    upateHashUrl(nextCountryName);
  })
  
  buttonPrevious.addEventListener('click', (e)=>{
    e.preventDefault();
    if(currIndex > 0) {
      const previousCountryData = retrievedCountriesData[currIndex - 1];
      upateHashUrl(previousCountryData.name.common);
    }
  })
  
  
  
  countryView.addRenderHandler(controlCountry);
  searchView.addHandlerSearch(controlSearch);
}

function controlSearch(){
  const countryName = searchView.getCountry();
  if(!countryName) return;
  upateHashUrl(countryName);
}

async function controlCountry() {
  try{
    const urlHash = decodeURIComponent(window.location.hash);
    if(!urlHash) return;
    countryView.renderSpinner();
    
    currentCountry  = urlHash.slice(1);
    let countryIndex = retrievedCountriesData.findIndex(countryData => countryData.name.common === currentCountry);
    let data;
    if(countryIndex === -1) {
      currIndex = retrievedCountriesData.length;
      data = await retrieveCountryByName(currentCountry);
    } else {
      currIndex = countryIndex;
      data =  retrievedCountriesData[countryIndex];
    }
    displayCountry(data);
  } catch(e){
    countryView.renderError();
    const similarResults = fuse.search(currentCountry);
    const similarCountryNames = similarResults.slice(0, 5).map(res => res.item);
    if(similarCountryNames.length > 0){
      countryView.renderBadges(similarCountryNames);
    }
  }
}

async function retrieveCountryByName(countryName){
  const data = await getCountryDataByName(countryName);
  console.log(data)
  retrievedCountriesData.push(data[0]);
  return data[0];
}

function upateHashUrl(countryName){
  window.location.hash = countryName;
}

function displayCountry(data){
  countryView.render(data);
  mapView.render(data);
}


initApp();








