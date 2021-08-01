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







class Application {
  map;
  retrievedcountriesData = [];
  retrievedCountriesCodes = [];
  index = 0;
  countriesStored = [];
  countries = [];
  markers = [];
  geojson;

  constructor() {
    this._init();
    
  }

  _init() {
    this._initMap();
    this._initButtons();
  }

  _initMap(){
    this.map = L.map('map');
    this.map.createPane('labels');
    this.map.getPane('labels').style.zIndex = 650;
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
      if(this.retrievedCountriesCodes.length > this.index + 1) {
        this.index++;
        const nextCountryPromise = this.retrievedcountriesData[this.index];
        nextCountryPromise.then(d=>this._displayCountry(d));
      }
    })
    
    buttonPrevious.addEventListener('click', (e)=>{
      e.preventDefault();
      if(this.index > 0) {
        const nextCountryPromise = this.retrievedcountriesData[--this.index];
        nextCountryPromise.then(d=>this._displayCountry(d));
      }
    })

    buttonSearch.addEventListener('click', openModal);
    btnCloseModal.addEventListener('click', closeModal);
  }

  async retrieveConuntryByCode(code){
    this.retrievedCountriesCodes.push(code);
    const response = await fetch(`https://restcountries.eu/rest/v2/alpha/${code}`);
    const data = await response.json();
    data.borders.filter(c=>!this.retrievedCountriesCodes.includes(c)).forEach(c=>this.retrievedcountriesData.push(this.retrieveConuntryByCode(c)));
    return data;
}

  retrieveConuntryByName(country){
      fetch(`https://restcountries.eu/rest/v2/name/${country}`)
      .then(response => {
        console.log(response);
        return response.json();
      })
      .then(data => {
        console.log(data);
        data[0].borders.filter(c=>!this.retrievedCountriesCodes.includes(c)).forEach(c=>this.retrievedcountriesData.push(this.retrieveConuntryByCode(c)));
        this._displayCountry(data[0]);
      });
  }

  _displayCountry(data){
    const html = `
    <div class="country_data">
      <img class="country_img" src="${data.flag}" />
      <h3 class="country_name">${data.name}</h3>
      <h4 class="country_region">${data.subregion}</h4>
      <p class="country_row"><i class="fas fa-city"></i>${data.capital}</p>
      <p class="country_row"><i class="fas fa-male"></i>${(+data.population / 1000000).toFixed(2)}</p>
      <p class="country_row"><i class="fab fa-speakap"></i>${data.languages.map(d=>d.name).join(", ")}</p>
      <p class="country_row"><i class="fas fa-wallet"></i>${data.currencies.map(d=>`${d.name} (${d.symbol})`).join(", ")}</p>
    </div>
  `;
    countryInfo.innerHTML = '';
    countryInfo.insertAdjacentHTML('beforeend', html);

    const zoom = data.area > 10000000 ? 1 : (data.area > 7000000 ? 2 : (data.area > 3000000 ? 3 : (data.area > 1000000 ? 4 : (data.area > 300000 ? 5 : 6))))
    this.map.setView(data.latlng, zoom);
    this.markers.forEach(m=>m.remove());
  
    const mainCities = cities[data.alpha3Code];
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
        this.markers.push(marker);
      })
    }

    var states = borderPoints[data.alpha3Code].map(arr=>{return {
      "type": "Feature",
      "properties": {"party": "Republican"},
      "geometry": {
          "type": "Polygon",
          "coordinates": [arr]
      }
  }});
  
    if(this.geojson){this.geojson.remove();}
      this.geojson = L.geoJSON(states, {
          style: function(feature) {
              switch (feature.properties.party) {
                  case 'Republican': return {color: "#ff0000"};
                  case 'Democrat':   return {color: "#0000ff"};
              }
          }
      });

      this.geojson.addTo(this.map);
  }
}

const app = new Application();
app.retrieveConuntryByName("Poland");
