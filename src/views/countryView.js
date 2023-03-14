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

    renderError(message){
        this.#clear();
        const markup = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>
        `;
        this.#parentEl.insertAdjacentHTML('beforeend', markup);
    }

    renderBadges(countryNames){
        if(countryNames.length === 0) return;
        const markup = `
        <div class="alert alert-info" role="alert">
            Did you mean: ${countryNames.map(cName => `<a href="#${cName}" class="badge badge-pill badge-blue">${cName}</a>`).join('')}
        </div>
        `;
        this.#parentEl.insertAdjacentHTML('beforeend', markup);
    }

    addRenderHandler(handler){
        ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
    }

    addNextButtonHandler(handler){
        document.getElementById('next').addEventListener('click', (e)=>{
            e.preventDefault();
            handler();
        })
    }

    addPrevButtonHandler(handler){
        document.getElementById('previous').addEventListener('click', (e)=>{
            e.preventDefault();
            handler();
        })
    }

    #clear(){
        this.#parentEl.innerHTML = '';
    }

    #generateMarkup(){
        const {commonName,
            officialName,
            currencies,
            capital,
            spellings,
            region,
            subregion,
            languages,
            area,
            population,
            flag,
            flagPicture,
            flagAlt
        } = this.#data;
        return `
        <div class="card" style="width: 18rem;">
            <img class="country_img" crossOrigin = "anonymous" alt=${flagAlt} src="${flagPicture}" />
            <div class="card-body">
                <h5 class="card-title">${officialName}</h5>
                <p class="card-text">${region} (${subregion}) ${flag}</p>
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item"><i class="fas fa-city"></i>${capital ?? 'no data'}</li>
                <li class="list-group-item"><i class="fas fa-male"></i>${(+population / 1_000_000).toFixed(4)} mln</li>
                <li class="list-group-item"><i class="fab fa-speakap"></i>${languages ? languages.join(', ') : 'no data'}</li>
                <li class="list-group-item"><i class="fas fa-wallet"></i>${currencies ? currencies.map(curr => `${curr.name} (${curr.symbol})`).join(', ') : 'no data'}</li>
            </ul>
        </div>
        `
        // return `
        // <div class="country_data">
        //     <img class="country_img" crossOrigin = "anonymous" alt=${flagAlt} src="${flagPicture}" />
        //     <h3 class="country_name">${officialName}</h3>
        //     <h4 class="country_region">${subregion}</h4>
        //     <p class="country_row"><i class="fas fa-city"></i>${capital ?? 'no data'}</p>
        //     <p class="country_row"><i class="fas fa-male"></i>${(+population / 1_000_000).toFixed(4)} mln</p>
        //     <p class="country_row"><i class="fab fa-speakap"></i>${languages ? languages.join(', ') : 'no data'}</p>
        //     <p class="country_row"><i class="fas fa-wallet"></i>${currencies ? currencies.map(curr => `${curr.name} (${curr.symbol})`).join(', ') : 'no data'}</p>
        // </div>
        // `
    }
}

export default new CountryView();