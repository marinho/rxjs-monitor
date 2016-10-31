import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RxjsMonitorComponent } from './rxjs-monitor.component';
import { MomentPipe } from './moment.pipe';

@NgModule({
    imports: [
        BrowserModule
    ],
    exports: [
        RxjsMonitorComponent,
        MomentPipe
    ],
    declarations: [
        RxjsMonitorComponent,
        MomentPipe
    ],
    providers: [],
})
export class RxjsMonitorModule { }
