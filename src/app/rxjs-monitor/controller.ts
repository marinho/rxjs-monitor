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

    /**
     * Patch an observable prototype or instance wraping .subscribe() method
     * with an implementation that watches the subscription.
     * 
     * @param obsOrPrototype    the Observable prototype or instance
     * @param types             a list of covered subscribers. For prototype,
     *                          it's recommended to set only ['Subscriber']
     * 
     * Usages:
     *
     * - RxMonitor.instance.patch(Observable.prototype)
     * - RxMonitor.instance.patch(observableHere)
     * - .let(obs => RxMonitor.instance.patch(obs))
     */
    patch(obsOrPrototype, types?: string[]) {
        const _instance = this;
        obsOrPrototype.originalSubscribeFn = obsOrPrototype.subscribe;

        obsOrPrototype.subscribe = function () {
            return _instance.subscribe(this, obsOrPrototype.originalSubscribeFn, arguments, types);
        };

        return obsOrPrototype;
    }

    /**
     * Unwrap the Observable prototype or instance by replacing the wrapper method
     * to the original function.
     * 
     * @param obsOrPrototype    the Observable prototype or instance
     * 
     * Usages:
     *
     * - RxMonitor.instance.unpatch(Observable.prototype)
     * - RxMonitor.instance.unpatch(observableHere)
     * - .let(obs => RxMonitor.instance.unpatch(obs))
     */
    unpatch(obsOrPrototype) {
        if (obsOrPrototype.originalSubscribeFn !== undefined) {
            obsOrPrototype.subscribe = function () {
                return obsOrPrototype.originalSubscribeFn.apply(obsOrPrototype, arguments);
            }
        }

        obsOrPrototype.unpatchSubscribeFn = true;
        return obsOrPrototype;
    }

    /**
     * Patch the Subscription's unsubscribe method by wrapping it by a function that
     * allows watching the unsubscription for monitoring reasons.
     * 
     * @param subsPrototype    the Subscription prototype or instance
     * 
     * Usages:
     *
     * - RxMonitor.instance.patchUnsubscribe(Subscription.prototype)
     * - RxMonitor.instance.patchUnsubscribe(subscriptionHere)
     */
    patchUnsubscribe(subsPrototype) {
        const _instance = this;
        const unsubscribeFn = subsPrototype.unsubscribe;
        subsPrototype.unsubscribe = function () {
            const wrapped = _instance.subscriptions.filter(s => s.subscription === this)[0];
            if (wrapped) {
                wrapped.completion = new Date();
                wrapped.watcheable.unsubscribe();
            }
            return unsubscribeFn.apply(this, arguments);
        };
    }

    /**
     * Wrapper for subscribe method, taking place after patch
     */
    subscribe(obs: Observable<any>, subscribeFn: any, args: any, types?: string[]) {
        const sub = subscribeFn.apply(obs, args);
        if ((obs as any).unpatchSubscribeFn || types.indexOf(sub.constructor.name) < 0) {
            return sub;
        }

        const wrapped = this.wrapSubscription(obs, sub);

        wrapped.watcheable = new ReplaySubject();
        (wrapped.watcheable as any).subscribe = function () {
            return subscribeFn.apply(this, arguments);
        };
        subscribeFn.call(obs, wrapped.watcheable);

        this.subscriptions.push(wrapped);
        this.subscriptions$.next(this.subscriptions);
        return sub;
    }

    /**
     * Returns an object with the given subscription and additional information, such
     * as observable, name, creation time and tail of chained operations.
     */
    wrapSubscription(obs: any, sub: Subscription): WrapedSubscription {
        const tail = this.walkObs(obs, []);

        return {
            creation: new Date(),
            subscription: sub,
            observable: obs,
            name: tail[0].name,
            tail: tail
        }
    }

    /**
     * Walks on the observable chain to find the path of used operators and observable
     */
    walkObs(obs, tail): StreamItem[] {
        if (obs.operator) {
            return this.walkObs(obs.source, [this.makeOperator(obs)].concat(tail));
        } else if (obs.source) {
            return [this.makeObservable(obs.source)].concat(tail);
        } else {
            return [this.makeObservable(obs)].concat(tail);
        }
    };

    /**
     * Returns object with observable information used by walkObs
     */
    makeObservable(obs): StreamItem {
        const name = obs.constructor.name;
        return {
            type: 'observable',
            name: parseObservableName(name)
        }
    }

    /**
     * Returns object with operator information used by walkObs
     */
    makeOperator(obs): StreamItem {
        const op = obs.operator
        const name = op.constructor.name.replace(/Operator/, '');
        return {
            type: 'operator',
            name: parseOperatorName(name)
        }
    }

    /**
     * Removes all completed subscriptions from the list
     */
    clearCompletedSubscriptions() {
        this.subscriptions = this.subscriptions.filter(s => !s.subscription.closed);
        this.subscriptions$.next(this.subscriptions);
    }

}
