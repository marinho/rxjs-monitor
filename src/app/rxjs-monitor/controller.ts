import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { StreamItem, WrapedSubscription } from './interfaces';
import { parseOperatorName, parseObservableName } from './dicts';

export class RxMonitor {
    static instance: RxMonitor;

    static getInstance(): RxMonitor {
        if (!RxMonitor.instance) {
            RxMonitor.instance = new RxMonitor();
        }
        return RxMonitor.instance;
    }

    subscriptions: WrapedSubscription[] = [];
    subscriptions$ = new ReplaySubject(1);

    constructor() {
    }

    /* Usages:
     *
     * RxMonitor.instance.patch(observableHere)
     * .let(obs => RxMonitor.instance.patch(obs))
     */
    patch(obsOrPrototype) {
        // FIXME: doesn't support prototype yet
        // FIXME: this approach can be replaced by a .let() or .lift()
        //        but they could reduce chances to patch the prototype
        const _instance = this;
        const newObs = obsOrPrototype;
        const subscribeFn = newObs.subscribe;

        newObs.subscribe = function () {
            return _instance.subscribe(this, subscribeFn, arguments);
        };

        return newObs;
    }

    patchUnsubscribe(subsPrototype) {
        const _instance = this;
        const unsubscribeFn = subsPrototype.unsubscribe;
        subsPrototype.unsubscribe = function () {
            const wrapped = _instance.subscriptions.filter(s => s.subscription === this)[0];
            if (wrapped) {
                wrapped.watcheable.unsubscribe();
            }
            return unsubscribeFn.apply(this, arguments);
        };
    }

    subscribe(obs: Observable<any>, subscribeFn: any, args: any) {
        const sub = subscribeFn.apply(obs, args);
        const wrapped = this.wrapSubscription(obs, sub);

        wrapped.watcheable = new ReplaySubject();
        subscribeFn.call(obs, wrapped.watcheable);

        this.subscriptions.push(wrapped);
        this.subscriptions$.next(this.subscriptions);
        return sub;
    }

    wrapSubscription(obs: any, sub: Subscription): WrapedSubscription {
        const tail = this.walkObs(obs, []);

        return {
            subscription: sub,
            observable: obs,
            name: tail[0].name,
            tail: tail
        }
    }

    walkObs(obs, tail): StreamItem[] {
        if (obs.operator) {
            return this.walkObs(obs.source, [this.makeOperator(obs)].concat(tail));
        } else if (obs.source) {
            return [this.makeObservable(obs.source)].concat(tail);
        } else {
            return [this.makeObservable(obs)].concat(tail);
        }
    };

    makeObservable(obs): StreamItem {
        const name = obs.constructor.name.replace(/Observable/, '');
        return {
            type: 'observable',
            name: parseObservableName(name)
        }
    }

    makeOperator(obs): StreamItem {
        const op = obs.operator
        const name = op.constructor.name.replace(/Operator/, '');
        return {
            type: 'operator',
            name: parseOperatorName(name)
        }
    }

    clearCompletedSubscriptions() {
        this.subscriptions = this.subscriptions.filter(s => !s.subscription.closed);
        this.subscriptions$.next(this.subscriptions);
    }

}
