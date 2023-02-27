const apiLink = 'https://restcountries.com';
const apiVersion = '3.1';

async function getCountryDataByCode(code){
    try{
        const response = await fetch(`${apiLink}/v${apiVersion}/alpha/${code}`);
        const data = await response.json();
        return data;
    } catch(err){
        return [];
    }
}

async function getCountryDataByName(name){
    try{
        const response = await fetch(`${apiLink}/v${apiVersion}/name/${name}`)
        const data = await response.json();
        return data;
    } catch(err){
        return [];
    }
}

export {getCountryDataByCode, getCountryDataByName};