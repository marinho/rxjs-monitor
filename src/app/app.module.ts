import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { RxjsMonitorModule } from './rxjs-monitor'
import { GeoService } from './shared/geo.service';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpModule,
        RxjsMonitorModule
    ],
    providers: [
        GeoService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
