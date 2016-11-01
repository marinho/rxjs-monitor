import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { RxMonitor } from './controller';

@Component({
    selector: 'rxjs-monitor',
    templateUrl: 'rxjs-monitor.component.html',
    styleUrls: [ 'rxjs-monitor.component.css' ]
})
export class RxjsMonitorComponent implements OnInit, OnDestroy {

    @HostBinding('class.expanded') expanded = true;
    @HostBinding('class.collapsed') collapsed = false;

    subs: RxMonitor;
    subscriptions: Array<any> = [];
    disposer$ = new ReplaySubject();

    constructor() {
        this.subs = RxMonitor.instance;
    }

    ngOnInit() {
        this.subs.subscriptions$
            .takeUntil(this.disposer$)
            .let(obs => RxMonitor.instance.unpatch(obs))
            .subscribe((s: Array<any>) => this.subscriptions = s);
    }

    ngOnDestroy() {
        this.disposer$.next(true);
    }

    togglePane() {
        this.expanded = !this.expanded;
        this.collapsed = !this.collapsed;
    }

    clearCompletedSubscriptions() {
        RxMonitor.instance.clearCompletedSubscriptions();
    }

}