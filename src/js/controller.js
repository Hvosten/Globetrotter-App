import 'core-js/stable';
import 'regenerator-runtime/runtime';

import countryView from '../views/countryView.js';
import mapView from '../views/mapView.js';

import {getCountryDataByName, getCountryDataByCode, getAllCountries} from './api.js';
import {generateRandomInteger} from './utils.js';

const buttonNext = document.getElementById('next');
const buttonPrevious = document.getElementById('previous');
const buttonSearch = document.getElementById('search');



class Application {
  retrievedCountriesData = [];
  retrievedCountriesCodes = [];
  allCountriesCodes = [];
  currIndex = 0;

  constructor() {
    mapView.initMap();
    this._initButtons();
    this._initCountries();
  }

  async _initCountries() {
    this.allCountries = await getAllCountries();
    const countryName = this._getRandomCountry();
    this._upateHashUrl(countryName);
  }

  _getRandomCountry(){
    const randomIndex = generateRandomInteger(0, this.allCountries.length - 1);
    const {name} = this.allCountries.splice(randomIndex, 1)[0];
    return name;
    
  }

  _initButtons() {
    buttonNext.addEventListener('click', (e)=>{
      e.preventDefault();
      if(this.retrievedCountriesData.length > this.currIndex + 1) {
        this.currIndex++;
        const nextCountryData = this.retrievedCountriesData[this.currIndex];
        this._upateHashUrl(nextCountryData.name.common);
      }
    })
    
    buttonPrevious.addEventListener('click', (e)=>{
      e.preventDefault();
      if(this.currIndex > 0) {
        const previousCountryData = this.retrievedCountriesData[--this.currIndex];
        this._upateHashUrl(previousCountryData.name.common);
      }
    })

    window.addEventListener('hashchange', async (e) => {
      const urlHash = window.location.hash;
      if(!urlHash) return;
      
      const countryName  = urlHash.slice(1);
      let data = this.retrievedCountriesData.find(countryData => countryData.name.common === countryName);
      if(!data) data = await this.retrieveCountryByName(countryName);
      this._displayCountry(data);
      await this.retrieveCountryByName(this._getRandomCountry());
    })
  }

  async retrieveConuntryByCode(countryCode){
    const data = await getCountryDataByCode(countryCode);
      
    this.retrievedCountriesData.push(data[0]);
    return data[0];
}

  async retrieveCountryByName(countryName){
      const data = await getCountryDataByName(countryName);
      
      this.retrievedCountriesData.push(data[0]);
      return data[0];
  }

  _upateHashUrl(countryName){
    window.location.hash = countryName;
  }

  _displayCountry(data){
    countryView.renderSpinner();
    countryView.render(data);
    mapView.render(data);
  }
}

const app = new Application();




