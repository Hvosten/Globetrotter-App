'use strict';

import borderPoints from '../data/borderPoints.js';
import cities from '../data/cities.js';
import {getCountryDataByName, getCountryDataByCode, getAllCountriesCodes} from './api.js';

const imageContainer = document.querySelector('.images');
const countryInfo = document.getElementById('country_info');
const buttonNext = document.getElementById('next');
const buttonPrevious = document.getElementById('previous');
const buttonSearch = document.getElementById('search');
const btnCloseModal = document.querySelector('.close-modal');
const img = document.querySelector('.country_img');

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');

const openModal = function () {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};


function generateRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Application {
  map;
  retrievedCountriesData = [];
  retrievedCountriesCodes = [];
  allCountriesCodes = [];
  currIndex = 0;
  cityMarkers = [];
  borderData;

  constructor() {

    this._initMap();
    this._initButtons();
    //this.retrieveConuntryByName("Poland");
    this._initCountries();
  }

  async _initCountries() {
    this.allCountriesCodes = await getAllCountriesCodes(); 
    const data = await this._getRandomCountry();
    this._displayCountry(data);
    await this._getRandomCountry();
  }

  async _getRandomCountry(){
    const randomIndex = generateRandomInteger(0, this.allCountriesCodes.length - 1);
    const countryCode = this.allCountriesCodes.splice(randomIndex, 1)[0];
    const data = await getCountryDataByCode(countryCode);
    this.retrievedCountriesData.push(data[0]);
    return data[0];
  }

  _initMap(){
    this.map = L.map('map');
    this.map.createPane('labels');
    this.map.getPane('labels').style.zcurrIndex = 650;
    this.map.getPane('labels').style.pointerEvents = 'none';

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
            attribution: '©OpenStreetMap, ©CartoDB'
    }).addTo(this.map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
            attribution: '©OpenStreetMap, ©CartoDB',
            pane: 'labels'
    }).addTo(this.map);

    this.map.on('click',(w)=>console.log(w))
  }

  _initButtons() {
    buttonNext.addEventListener('click', (e)=>{
      e.preventDefault();
      if(this.retrievedCountriesData.length > this.currIndex + 1) {
        this.currIndex++;
        const nextCountryData = this.retrievedCountriesData[this.currIndex];
        this._displayCountry(nextCountryData);
        this._getRandomCountry();
      }
    })
    
    buttonPrevious.addEventListener('click', (e)=>{
      e.preventDefault();
      if(this.currIndex > 0) {
        const previousCountryData = this.retrievedCountriesData[--this.currIndex];
        this._displayCountry(previousCountryData);
      }
    })

    buttonSearch.addEventListener('click', openModal);
    btnCloseModal.addEventListener('click', closeModal);
  }

  async retrieveConuntryByCode(code){
    this.retrievedCountriesCodes.push(code);
    const data = await getCountryDataByCode(code);
    //console.log(data)
    data[0].borders.filter(c=>!this.retrievedCountriesCodes.includes(c))
      .forEach(c=>this.retrievedCountriesData.push(this.retrieveConuntryByCode(c)));
    return data;
}

  async retrieveConuntryByName(country){
      const data = await getCountryDataByName(country)
      
      data[0].borders.filter(c=>!this.retrievedCountriesCodes.includes(c))
        .forEach(c=>this.retrievedCountriesData.push(this.retrieveConuntryByCode(c)));
      this._displayCountry(data[0]);
  }

  _addMarkup(data) {
    console.log(data);
    console.log('xxxxxxxxxxx');
    const {flags, name, population, languages, currencies} = data;
    const html = `
    <div class="country_data">
      <img class="country_img" alt=${flags.alt} src="${flags.png}" />
      <h3 class="country_name">${name.official}</h3>
      <h4 class="country_region">${data.subregion}</h4>
      <p class="country_row"><i class="fas fa-city"></i>${data.capital}</p>
      <p class="country_row"><i class="fas fa-male"></i>${(+population / 1000000).toFixed(2)}</p>
      <p class="country_row"><i class="fab fa-speakap"></i>${languages ? Object.values(languages).join(', ') : ''}</p>
      <p class="country_row"><i class="fas fa-wallet"></i>${Object.values(currencies).map(val => `${val.name} (${val.symbol})`).join(', ')}</p>
    </div>
  `;
  //.map(curr=>`${curr.name} (${curr.symbol})`).join(", ")
    countryInfo.innerHTML = '';
    countryInfo.insertAdjacentHTML('beforeend', html);
  }

  _adjustMap(data) {
    const zoom = data.area > 10000000 ? 1 : (data.area > 7000000 ? 2 : (data.area > 3000000 ? 3 : (data.area > 1000000 ? 4 : (data.area > 300000 ? 5 : 6))))
    this.map.setView(data.latlng, zoom);
  }

  _addCities(data) {
    this.cityMarkers.forEach(m=>m.remove());
  
    const mainCities = cities[data.cca3];
    if(mainCities) {
      mainCities.forEach(c=>{
        const marker = L.marker(c.latlng);
        marker.addTo(this.map)
        .bindPopup(
          L.popup({
            autoClose: false,
            closeOnClick: false,
            //className: `${workout.type}-popup`,
          })
        )
        .setPopupContent(
          c.city
        )
        .openPopup();
        this.cityMarkers.push(marker);
      })
    }
  }

  _addBorders(data) {
    const states = borderPoints[data.cca3].map(arr=>{return {
      "type": "Feature",
      "properties": {"party": "Republican"},
      "geometry": {
          "type": "Polygon",
          "coordinates": [arr]
      }
    }});
  
    if(this.borderData){this.borderData.remove();}
      this.borderData = L.geoJSON(states, {
          style: function(feature) {
              switch (feature.properties.party) {
                  case 'Republican': return {color: "#ff0000"};
                  case 'Democrat':   return {color: "#0000ff"};
              }
          }
      });

      this.borderData.addTo(this.map);
  }

  _displayCountry(data){
    this._addMarkup(data);
    this._adjustMap(data);
    this._addCities(data);
    this._addBorders(data);
  }
}

const app = new Application();
