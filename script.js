'use strict';

const imageContainer = document.querySelector('.images');
const countryInfo = document.getElementById('country_info');
const button = document.getElementById('next');
const img = document.querySelector('.country_img');

const countriesDisplayed = [];
const countriesToDisplay = [];

const displayCountry = (data) => {
    //const html = `<img class="country__img" src="${data.flag}" />`;
    //imageContainer.html = '';
    //imageContainer.insertAdjacentHTML('beforeend', html);
    img.src = data.flag;
    countryInfo.textContent = `${data.name}, ${data.capital}`
}

const retrieveConuntryByCode = async (code) => {
    countriesDisplayed.push(code)
    const response = await fetch(`https://restcountries.eu/rest/v2/alpha/${code}`)
    const data = await response.json();
    data.borders.filter(c=>countriesDisplayed.indexOf(c) === -1).forEach(c=>countriesToDisplay.push(retrieveConuntryByCode(c)));
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
      displayCountry(data[0]);
    });
}

button.addEventListener('click', (e)=>{
  e.preventDefault();
  const nextCountryPromise = countriesToDisplay.shift().then(d=>displayCountry(d))
})
console.log('HERE')
retrieveConuntryByCode('DZA')
console.log('HERE')
