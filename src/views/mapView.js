import L from 'leaflet';
import cities from '../data/cities.js';
import borderPoints from '../data/borderPoints.js';

import {getImgDominantColor, getPalette, getZoom, changePropery} from '../js/utils.js';

class MapView{
    #map;
    #cityMarkers;
    #borderData;

    initMap(){
        this.#map = L.map('map');
        this.#map.createPane('labels');
        this.#map.getPane('labels').style.zcurrIndex = 650;
        this.#map.getPane('labels').style.pointerEvents = 'none';

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
                attribution: '©OpenStreetMap, ©CartoDB'
        }).addTo(this.#map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                attribution: '©OpenStreetMap, ©CartoDB',
                pane: 'labels'
        }).addTo(this.#map);

        this.#map.setView([0, 0], 0);
        //this.#map.on('click',(w)=>console.log(w))
    }

    render(data){
        const {codeAlpha3, area, latlng} = data;
        this.#addBorders(codeAlpha3);
        this.#addCities(codeAlpha3);
        this.#adjustMapZoom(area, latlng);
    }

    async #getColors(){
        const countryImg = document.querySelector('.country_img');
        const color = await getImgDominantColor(countryImg);
        const pallete = await getPalette(countryImg);

        const rootEl = document.querySelector(':root');
        pallete.slice(0, 2).forEach((c, i) => {
            changePropery(rootEl, `--city${i+1}-color`, c)
        })

        return color;
    }

    #addCities(countryCode) {
        if(this.#cityMarkers) this.#cityMarkers.forEach(m => m.remove());
        else this.#cityMarkers = [];
        
        const mainCities = cities[countryCode];
        if(mainCities) {
            mainCities.forEach((c,i) => {
                const marker = L.marker(c.latlng);
                marker.addTo(this.#map)
                    .bindPopup(
                        L.popup({
                            autoClose: false,
                            closeOnClick: false,
                            className: `city${i+1}-popup`,
                        })
                    )
                    .setPopupContent(
                        c.city
                    )
                    .openPopup();
                this.#cityMarkers.push(marker);
            })
        }
    }

    async #addBorders(countryCode) {
        const color = await this.#getColors();
        
        if(this.#borderData) this.#borderData.remove();
        
        const countryBorderPoints = borderPoints[countryCode];

        if(!countryBorderPoints) return;

        const countryBorderPointsObj = {
            "type": "Feature",
            "properties": {"party": "Republican"},
            "geometry": {
                "type": "Polygon",
                "coordinates": countryBorderPoints
            }
        }
        
    
        this.#borderData = L.geoJSON(countryBorderPointsObj, {
          style: function() {
            return {color};
          }
        });
    
        this.#borderData.addTo(this.#map);
    }

    #adjustMapZoom(area, latlng) {
        const zoom = getZoom(area);
        this.#map.flyTo(latlng, zoom, {duration: 5});
    }
}

export default new MapView();