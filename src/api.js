import { API_LINK, API_VERSION } from './config.js';

async function getCountryDataByCode(code){
    try{
        const response = await fetch(`${API_LINK}/v${API_VERSION}/alpha/${code}`);
        const data = await response.json();
        return data;
    } catch(err){
        throw new Error(`Error fetching country data: ${err.message}`);
    }
}

async function getCountryDataByName(name){
    try{
        const response = await fetch(`${API_LINK}/v${API_VERSION}/name/${name}`)
        const data = await response.json();
        return data;
    } catch(err){
        throw new Error(`Error fetching country data: ${err.message}`);
    }
}

async function getAllCountriesWithFields(requestedFields){
    if(!requestedFields || !requestedFields.length === 0) throw new Error(`Please specify what fields you want to retrieve`);
    const requestedFieldsStr = requestedFields.join(',');
    try{
        const response = await fetch(`${API_LINK}/v${API_VERSION}/all?fields=${requestedFieldsStr}`);
        const data = await response.json();
        return data
    } catch(err){
        throw new Error(`Error fetching countries: ${err.message}`);
    }
}

async function getAllCountries(){
    const data = await getAllCountriesWithFields(['cca3', 'name']);
    return data.map(obj => {return {code: obj.cca3, name: obj.name.common}});
}

export {getCountryDataByCode, getCountryDataByName, getAllCountries};