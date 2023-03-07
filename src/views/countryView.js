class CountryView{
    #parentEl = document.getElementById('country_info');
    #data;

    render(data){
        this.#data = data;
        this.#clear();
        this.#parentEl.insertAdjacentHTML('beforeend', this.#generateMarkup());
    }

    renderSpinner(){
        this.#clear();
        const markup = `
        <div class="spinner-grow" role="status">
            <span class="sr-only">Loading...</span>
        </div>
        `;
        this.#parentEl.insertAdjacentHTML('beforeend', markup);
    }

    #clear(){
        this.#parentEl.innerHTML = '';
    }

    #generateMarkup(){
        const {flags, name, population, languages, currencies} = this.#data;
        return `
        <div class="country_data">
            <img class="country_img" crossOrigin = "anonymous" alt=${flags.alt} src="${flags.png}" />
            <h3 class="country_name">${name.official}</h3>
            <h4 class="country_region">${this.#data.subregion}</h4>
            <p class="country_row"><i class="fas fa-city"></i>${this.#data.capital}</p>
            <p class="country_row"><i class="fas fa-male"></i>${(+population / 1_000_000).toFixed(4)} mln</p>
            <p class="country_row"><i class="fab fa-speakap"></i>${languages ? Object.values(languages).join(', ') : 'no data'}</p>
            <p class="country_row"><i class="fas fa-wallet"></i>${currencies ? Object.values(currencies).map(val => `${val.name} (${val.symbol})`).join(', ') : 'no data'}</p>
        </div>
        `
    }
}

export default new CountryView();