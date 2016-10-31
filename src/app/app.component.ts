import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { RxMonitor } from './rxjs-monitor/controller';
import { GeoService, Country, City } from './shared/geo.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'app works!';

    obs1$: Observable<any>;
    sub1$: Subscription;
    value1: any;
    disposer1$ = new ReplaySubject();

    countries$ = new ReplaySubject();
    cities$ = new ReplaySubject();
    citiesByCountry$: Observable<any>;

    constructor(public geo: GeoService) { }

    ngOnInit() {
        this.obs1$ = Observable.interval(100)
            .do(x => { /* ... */ })
            .map(x => x * 10)
            .do(x => { /* ... */ })
            .filter(x => x % 3 === 0)
            .do(x => { /* ... */ })
            .let(obs => RxMonitor.instance.patch(obs));

        const flattenCities = (group) => {
            return this.countries$
                .switchMap((v: Array<any>) => Observable.from(v))
                .single((c: Country) => c.id === group.key)
                .combineLatest(group.toArray())
                .map(values => {
                    return { country: values[0], cities: values[1] };
                });
                // .let(obs => RxMonitor.instance.patch(obs))
        };

        this.citiesByCountry$ = this.cities$
            .switchMap((v: Array<any>) => Observable.from(v))
            .groupBy((v: City) => v.country)
            .flatMap(flattenCities)
            .toArray()
            .map(v => JSON.stringify(v))
            .let(obs => RxMonitor.instance.patch(obs));
    }

    ngOnDestroy() {
        this.disposer1$.next(true);
    }

    start1() {
        this.sub1$ = this.obs1$
            .takeUntil(this.disposer1$)
            .subscribe(v => this.value1 = v);
    }

    stop1() {
        this.disposer1$.next(true);
        this.disposer1$ = new ReplaySubject();
    }

    getCountries() {
        this.geo.getCountries()
            .let(obs => RxMonitor.instance.patch(obs))
            .subscribe(this.countries$);
    }

    getCities() {
        this.geo.getCities()
            .let(obs => RxMonitor.instance.patch(obs))
            .subscribe(this.cities$);
    }

}
