'use strict';

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

const apiLink = 'https://restcountries.com';
const apiVersion = '3.1';


class Application {
  map;
  retrievedcountriesData = [];
  retrievedCountriesCodes = [];
  currIndex = 0;
  cityMarkers = [];
  borderData;

  constructor() {
    this._init();
    this.retrieveConuntryByName("Poland");
  }

  _init() {
    this._initMap();
    this._initButtons();
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
      if(this.retrievedCountriesCodes.length > this.currIndex + 1) {
        this.currIndex++;
        const nextCountryPromise = this.retrievedcountriesData[this.currIndex];
        nextCountryPromise.then(d=>this._displayCountry(d[0]));
      }
    })
    
    buttonPrevious.addEventListener('click', (e)=>{
      e.preventDefault();
      if(this.currIndex > 0) {
        const nextCountryPromise = this.retrievedcountriesData[--this.currIndex];
        nextCountryPromise.then(d=>this._displayCountry(d[0]));
      }
    })

    buttonSearch.addEventListener('click', openModal);
    btnCloseModal.addEventListener('click', closeModal);
  }

  async retrieveConuntryByCode(code){
    this.retrievedCountriesCodes.push(code);
    const response = await fetch(`${apiLink}/v${apiVersion}/alpha/${code}`);
    const data = await response.json();
    //console.log(data)
    data[0].borders.filter(c=>!this.retrievedCountriesCodes.includes(c)).forEach(c=>this.retrievedcountriesData.push(this.retrieveConuntryByCode(c)));
    return data;
}

  retrieveConuntryByName(country){
      fetch(`${apiLink}/v${apiVersion}/name/${country}`)
      .then(response => {
        //console.log(response);
        return response.json();
      })
      .then(data => {
        console.log(data);
        data[0].borders.filter(c=>!this.retrievedCountriesCodes.includes(c)).forEach(c=>this.retrievedcountriesData.push(this.retrieveConuntryByCode(c)));
        this._displayCountry(data[0]);
      })
      .catch(err =>{
        console.log(err);
      });
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
      <p class="country_row"><i class="fab fa-speakap"></i>${Object.values(languages).join(', ')}</p>
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
