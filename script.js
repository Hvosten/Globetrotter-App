'use strict';

const imageContainer = document.querySelector('.images');
const countryInfo = document.getElementById('country_info');
const buttonNext = document.getElementById('next');
const buttonPrevious = document.getElementById('previous');
const img = document.querySelector('.country_img');
let index = 0;

const countriesStored = [];
const countries = [];

const displayCountry = (data) => {
    img.src = data.flag;

    const html = `
    <div class="country_data">
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

retrieveConuntry('China')

