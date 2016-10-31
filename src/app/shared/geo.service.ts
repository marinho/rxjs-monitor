import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

export interface Country {
    id: string;
    name: string;
}

export interface City {
    id: number;
    name: string;
    country: string;
}

@Injectable()
export class GeoService {

    constructor (private http: Http) {}

    getCountries(): Observable<Country[]> {
        return this.http.get('/assets/data/countries.json')
            .map(res => res.json());
    }

    getCities(): Observable<City[]> {
        return this.http.get('/assets/data/cities.json')
            .map(res => res.json());
    }

}
