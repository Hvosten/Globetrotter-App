import { describe, it, expect } from 'vitest'
import { getJSON } from '../js/utils';

describe("getJSON()", () => {
    it("should return error 404 in case of wrong url", () => {
        const url = "https://restcountries.com/v3.1/name/dummy";
    
        return expect(getJSON(url)).rejects.toThrow(/404/);
    })

    it("should return error in case of no argument", () => {
    
        return expect(getJSON()).rejects.toThrow();
    })

    it("should resolve with correct url", () => {
        const url = "https://restcountries.com/v3.1/name/poland";
    
        return expect(getJSON(url)).resolves.toBeDefined();
    })
})