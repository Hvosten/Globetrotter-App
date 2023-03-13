import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as model from './model.js';
import TimeoutError from './errors/TimeoutError.js';


import countryView from '../views/countryView.js';
import mapView from '../views/mapView.js';
import searchView from '../views/searchView.js'


function nextCountryController(){
  upateHashUrl(model.getNextCountryName());
}

  
 function previousCountryController(){
  upateHashUrl(model.getPrevCountryName());
 }

function searchController(){
  const countryName = searchView.getCountry();
  if(!countryName) return;
  upateHashUrl(countryName);
}

async function countryController() {
  try{
    const urlHash = decodeURIComponent(window.location.hash);
    if(!urlHash) return;
    countryView.renderSpinner();
    
    const currentCountryName  = urlHash.slice(1);
    await model.getCountryData(currentCountryName);
    
    countryView.render(model.state.currentCountryData);
    mapView.render(model.state.currentCountryData);
  } catch(err){
    console.log(err);
    
    if (err instanceof TimeoutError){
      countryView.renderError(err.message);
    } else {
      countryView.renderError(`Couldn't find ${model.state.currentCountryName} country!`);
      model.generateSimilarCountries();
      countryView.renderBadges(model.state.similarCountryNames);
    }
  }
}

function upateHashUrl(countryName){
  if(!countryName) return;
  window.location.hash = countryName;
}

function initApp() {
  mapView.initMap();

  model.initCountries();

  searchView.addHandlerSearch(searchController);

  countryView.addRenderHandler(countryController);
  countryView.addNextButtonHandler(nextCountryController);
  countryView.addPrevButtonHandler(previousCountryController);
}

initApp();








