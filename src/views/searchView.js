class SearchView{
    #buttonSearch = document.getElementById('search');
    #inputEl = document.getElementById('countryInput');

    getCountry(){
        const country = this.#inputEl.value;
        this.#inputEl.value = '';
        return country;
    }

    addHandlerSearch(handler){
        this.#buttonSearch.addEventListener('click', (e) => {
            e.preventDefault();
            handler();
        })

        this.#inputEl.addEventListener('keypress', (e) => {
            if (e.key === "Enter"){
                e.preventDefault();
                handler();
            } 
        })
    }
}

export default new SearchView();