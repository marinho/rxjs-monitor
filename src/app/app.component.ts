import { Component, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { RxMonitor } from './rxjs-monitor/controller';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
    title = 'app works!';
    obs1$: Observable<any>;
    sub1$: Subscription;
    value1: any;

    disposer$ = new ReplaySubject();

    constructor() {
        this.obs1$ = RxMonitor.instance.patch(
          Observable.interval(100)
            .do(x => { /* ... */ })
            .map(x => x * 10)
            .do(x => { /* ... */ })
            .filter(x => x % 3 === 0)
            .do(x => { /* ... */ })
        );
    }

    ngOnDestroy() {
        this.disposer$.next(true);
    }

    start() {
        this.sub1$ = this.obs1$
            .takeUntil(this.disposer$)
            .subscribe(v => this.value1 = v);
    }

    stop() {
        this.disposer$.next(true);
        this.disposer$ = new ReplaySubject();
        // this.sub1$.unsubscribe();
    }
}
