'use strict';

const imageContainer = document.querySelector('.images');
const countryInfo = document.getElementById('country_info');
const buttonNext = document.getElementById('next');
const buttonPrevious = document.getElementById('previous');
const img = document.querySelector('.country_img');
let index = 0;
var map = L.map('map');
map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB'
}).addTo(map);

var positronLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        pane: 'labels'
}).addTo(map);

// var geojson = L.geoJson(euCountries).addTo(map);
// geojson.eachLayer(function (layer) {
//   layer.bindPopup(layer.feature.properties.name);
// });

// map.fitBounds(geojson.getBounds());

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

// L.marker([51.5, -0.09]).addTo(map)
//     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//     .openPopup();

const countriesStored = [];
const countries = [];
let marker;

const displayCountry = (data) => {
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

    const zoom = data.area > 10000000 ? 2 : (data.area > 7000000 ? 3 : (data.area > 3000000 ? 4 : (data.area > 1000000 ? 5 : (data.area > 300000 ? 6 : 7))))
    map.setView(data.latlng, zoom);
    if(marker){marker.remove();}
    marker = L.marker(data.latlng);
    marker.addTo(map)
    .bindPopup(data.name)
    .openPopup();
}

const retrieveConuntryByCode = async (code) => {
    countriesStored.push(code)
    const response = await fetch(`https://restcountries.eu/rest/v2/alpha/${code}`)
    const data = await response.json();
    data.borders.filter(c=>!countriesStored.includes(c)).forEach(c=>countries.push(retrieveConuntryByCode(c)));
    return data;
}

const retrieveConuntry = (country) => {
    fetch(`https://restcountries.eu/rest/v2/name/${country}`)
    .then(response => {
      console.log(response);
      return response.json();
    })
    .then(data => {
      console.log(data);
      data[0].borders.filter(c=>!countriesStored.includes(c)).forEach(c=>countries.push(retrieveConuntryByCode(c)));
      displayCountry(data[0]);
    });
}

buttonNext.addEventListener('click', (e)=>{
  e.preventDefault();
  console.log(countriesStored, index)
  if(countriesStored.length > index + 1) {
    index++;
    console.log(countriesStored, index)
    const nextCountryPromise = countries[index];
    nextCountryPromise.then(d=>displayCountry(d));
  }
})

buttonPrevious.addEventListener('click', (e)=>{
  e.preventDefault();
  if(index > 0) {
    const nextCountryPromise = countries[--index];
    nextCountryPromise.then(d=>displayCountry(d));
  }
})

retrieveConuntry('Poland')

