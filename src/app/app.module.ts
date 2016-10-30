import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { RxjsMonitorModule } from './rxjs-monitor'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RxjsMonitorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
