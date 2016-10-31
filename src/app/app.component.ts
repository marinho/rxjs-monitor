import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { RxMonitor } from './rxjs-monitor/controller';
import { GeoService, Country, City, Team } from './shared/geo.service';

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

    value2: string;
    inputValue: string;

    countries$ = new ReplaySubject();
    cities$ = new ReplaySubject();
    citiesByCountry$: Observable<any>;

    teams: Team[];

    form: FormGroup;

    constructor(public geo: GeoService,
        private fb: FormBuilder) {  }

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

        this.buildForm();
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

    startTimer() {
        this.value2 = '';
        Observable.timer(2000)
            .map(x => 'Done! ' + (new Date()).getTime())
            .let(obs => RxMonitor.instance.patch(obs))
            .subscribe((v: string) => this.value2 = v);
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

    getTeams() {
        Observable.fromPromise(this.geo.getTeams())
            .map(x => {
                let n = [].concat(x);
                n.sort((a: Team, b: Team) => a.name < b.name ? -1 : 1);
                return n;
            })
            .switchMap((v: Array<any>) => Observable.from(v))
            .map(t => t.name)
            .first()
            .let(obs => RxMonitor.instance.patch(obs))
            .subscribe((v: Team[]) => this.teams = v);
    }

    buildForm(): void {
        this.form = this.fb.group({
            'name': [ 'change this value', [ Validators.required ] ]
        });

        this.form.valueChanges
            .debounceTime(300)
            .map(data => data.name)
            .let(obs => RxMonitor.instance.patch(obs))
            .subscribe((data: string) => this.inputValue = data);
    }

}
