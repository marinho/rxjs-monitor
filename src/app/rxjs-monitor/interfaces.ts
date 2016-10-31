import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';

export interface StreamItem {
    type: 'observable' | 'operator';
    name: string;
    // subject?: ReplaySubject<any>;
}

export interface WrapedSubscription {
    subscription: Subscription;
    observable: Observable<any>;
    name: string;
    tail: StreamItem[];
    watcheable?: ReplaySubject<any>;
}

