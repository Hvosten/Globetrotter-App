class CountryView{
    _parentEl = document.getElementById('country_info');
    _data;

    render(data){
        this._data = data;
        this._clear();
        this._parentEl.insertAdjacentHTML('beforeend', this._generateMarkup());
    }

    _clear(){
        this._parentEl.innerHTML = '';
    }

    _generateMarkup(){
        const {flags, name, population, languages, currencies} = this._data;
        return `
        <div class="country_data">
            <img class="country_img" crossOrigin = "anonymous" alt=${flags.alt} src="${flags.png}" />
            <h3 class="country_name">${name.official}</h3>
            <h4 class="country_region">${this._data.subregion}</h4>
            <p class="country_row"><i class="fas fa-city"></i>${this._data.capital}</p>
            <p class="country_row"><i class="fas fa-male"></i>${(+population / 1_000_000).toFixed(4)} mln</p>
            <p class="country_row"><i class="fab fa-speakap"></i>${languages ? Object.values(languages).join(', ') : 'no data'}</p>
            <p class="country_row"><i class="fas fa-wallet"></i>${currencies ? Object.values(currencies).map(val => `${val.name} (${val.symbol})`).join(', ') : 'no data'}</p>
        </div>
        `
    }
}

export default new CountryView();