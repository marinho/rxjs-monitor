import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RxjsMonitorComponent } from './rxjs-monitor.component';

@NgModule({
    imports: [
        BrowserModule
    ],
    exports: [ RxjsMonitorComponent ],
    declarations: [ RxjsMonitorComponent ],
    providers: [],
})
export class RxjsMonitorModule { }
