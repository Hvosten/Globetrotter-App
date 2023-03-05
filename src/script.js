import 'core-js/stable';
import 'regenerator-runtime/runtime';


import L from 'leaflet';
import borderPoints from '../data/borderPoints.js';
import cities from '../data/cities.js';
import {getCountryDataByName, getCountryDataByCode, getAllCountries} from './api.js';
import {generateRandomInteger, getImgDominantColor, getZoom} from './utils.js';


const countryInfo = document.getElementById('country_info');
const buttonNext = document.getElementById('next');
const buttonPrevious = document.getElementById('previous');
const buttonSearch = document.getElementById('search');
const btnCloseModal = document.querySelector('.close-modal');

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
    this.allCountries = await getAllCountries();
    const countryName = this._getRandomCountry();
    this._upateHashUrl(countryName);
  }

  _getRandomCountry(){
    const randomIndex = generateRandomInteger(0, this.allCountries.length - 1);
    const {name} = this.allCountries.splice(randomIndex, 1)[0];
    return name;
    
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

    this.map.setView([0, 0], 0);
    this.map.on('click',(w)=>console.log(w))
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

    buttonSearch.addEventListener('click', openModal);
    btnCloseModal.addEventListener('click', closeModal);

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

  _addMarkup(data) {
    const {flags, name, population, languages, currencies} = data;
    const html = `
    <div class="country_data">
      <img class="country_img" crossOrigin = "anonymous" alt=${flags.alt} src="${flags.png}" />
      <h3 class="country_name">${name.official}</h3>
      <h4 class="country_region">${data.subregion}</h4>
      <p class="country_row"><i class="fas fa-city"></i>${data.capital}</p>
      <p class="country_row"><i class="fas fa-male"></i>${(+population / 1_000_000).toFixed(4)} mln</p>
      <p class="country_row"><i class="fab fa-speakap"></i>${languages ? Object.values(languages).join(', ') : 'no data'}</p>
      <p class="country_row"><i class="fas fa-wallet"></i>${currencies ? Object.values(currencies).map(val => `${val.name} (${val.symbol})`).join(', ') : 'no data'}</p>
    </div>
  `;
  //.map(curr=>`${curr.name} (${curr.symbol})`).join(", ")
    countryInfo.innerHTML = '';
    countryInfo.insertAdjacentHTML('beforeend', html);

    ;
  }

  _adjustMap(data) {
    const zoom = getZoom(data.area);
    this.map.flyTo(data.latlng, zoom, {duration: 3});
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

  async _addBorders(data) {
    const countryBorderPoints = borderPoints[data.cca3].map(arr => { return {
      "type": "Feature",
      "properties": {"party": "Republican"},
      "geometry": {
          "type": "Polygon",
          "coordinates": [arr]
      }
    }});
  
    if(this.borderData) this.borderData.remove();
    const countryImg = document.querySelector('.country_img');
    const color = await getImgDominantColor(countryImg);

    this.borderData = L.geoJSON(countryBorderPoints, {
      style: function() {
        return {color};
      }
    });

    this.borderData.addTo(this.map);
  }

  _displayCountry(data){
    this._addMarkup(data);
    this._addCities(data);
    this._addBorders(data);
    this._adjustMap(data);
  }
}

const app = new Application();

if (module.hot) {
  module.hot.accept();
}





