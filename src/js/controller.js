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



class Application {
  retrievedCountriesData = [];
  allCountries = [];
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
      console.log(this.currIndex, this.retrievedCountriesData.length)
      e.preventDefault();
      let nextCountryName;
      if(this.retrievedCountriesData.length > this.currIndex + 1) {
        nextCountryName = this.retrievedCountriesData[this.currIndex + 1].name.common;
      } else {
        nextCountryName = this._getRandomCountry();
      }
      this._upateHashUrl(nextCountryName);
    })
    
    buttonPrevious.addEventListener('click', (e)=>{
      e.preventDefault();
      if(this.currIndex > 0) {
        const previousCountryData = this.retrievedCountriesData[this.currIndex - 1];
        this._upateHashUrl(previousCountryData.name.common);
      }
    })

    buttonSearch.addEventListener('click', (e) =>{
      e.preventDefault();
      const countryName = inputEl.value;
      if(countryName === "") return;
      this._upateHashUrl(countryName);
      inputEl.value = "";
    })

    window.addEventListener('hashchange', async (e) => {
      const urlHash = window.location.hash;
      if(!urlHash) return;
      countryView.renderSpinner();
      
      const countryName  = urlHash.slice(1);
      let countryIndex = this.retrievedCountriesData.findIndex(countryData => countryData.name.common === countryName);
      let data;
      if(countryIndex === -1) {
        this.currIndex = this.retrievedCountriesData.length;
        data = await this.retrieveCountryByName(countryName);
      } else {
        this.currIndex = countryIndex;
        data =  this.retrievedCountriesData[countryIndex];
      }
      this._displayCountry(data);
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
    console.log(data);
    countryView.render(data);
    mapView.render(data);
  }
}

const app = new Application();




