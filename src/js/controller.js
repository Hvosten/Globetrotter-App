import 'core-js/stable';
import 'regenerator-runtime/runtime';

import countryView from '../views/countryView.js';
import mapView from '../views/mapView.js';

import {getCountryDataByName, getCountryDataByCode, getAllCountries} from './api.js';
import {generateRandomInteger} from './utils.js';

const buttonNext = document.getElementById('next');
const buttonPrevious = document.getElementById('previous');
const buttonSearch = document.getElementById('search');
const inputEl = document.getElementById('countryInput');




const retrievedCountriesData = [];
let allCountries = [];
let currIndex = 0;

function initApp() {
  mapView.initMap();
  initButtons();
  initCountries();
}

async function initCountries() {
  allCountries = await getAllCountries();
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

  buttonSearch.addEventListener('click', (e) =>{
    e.preventDefault();
    const countryName = inputEl.value;
    if(countryName === "") return;
    upateHashUrl(countryName);
    inputEl.value = "";
  })

  countryView.addRenderHandler(controlCountry);
}

async function controlCountry() {

  const urlHash = window.location.hash;
  if(!urlHash) return;
  countryView.renderSpinner();
  
  const countryName  = urlHash.slice(1);
  let countryIndex = retrievedCountriesData.findIndex(countryData => countryData.name.common === countryName);
  let data;
  if(countryIndex === -1) {
    currIndex = retrievedCountriesData.length;
    data = await retrieveCountryByName(countryName);
  } else {
    currIndex = countryIndex;
    data =  retrievedCountriesData[countryIndex];
  }
  displayCountry(data);
}

async function retrieveConuntryByCode(countryCode){
  const data = await getCountryDataByCode(countryCode);
    
  retrievedCountriesData.push(data[0]);
  return data[0];
}

async function retrieveCountryByName(countryName){
    const data = await getCountryDataByName(countryName);
    
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




