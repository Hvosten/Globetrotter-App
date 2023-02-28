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

async function getAllCountries(requestedFields){
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

async function getAllCountriesCodes(){
    const data = await getAllCountries(['cca3']);
    return data.map(obj => obj['cca3']);
}

export {getCountryDataByCode, getCountryDataByName, getAllCountriesCodes};