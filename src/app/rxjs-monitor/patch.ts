import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { RxMonitor } from './controller';

(window as any).rxMonitor = RxMonitor.getInstance();
(window as any).rxMonitor.patchUnsubscribe(Subscription.prototype);

// Optional: patches any generic subscription
(window as any).rxMonitor.patch(Observable.prototype, ['Subscriber']);
