'use strict';

const imageContainer = document.querySelector('.images');
const countryInfo = document.getElementById('country_info');

const displayCountry = (data) => {
    const html = `<img class="country__img" src="${data.flag}" />`
    imageContainer.insertAdjacentHTML('beforeend', html);
    countryInfo.textContent = `${data.name}, ${data.capital}`
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

retrieveConuntry('Algeria')
