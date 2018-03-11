import { Component } from '@angular/core';
import { Events, NavController } from 'ionic-angular';
import { PedometerProvider } from '../../providers/pedometer/pedometer';
import { Observable, Subscription } from "rxjs";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  sessionActive = false;
  sessionData: any;
  dataInterval: Observable<any>;
  dataSubscription: Subscription;
  constructor(
    public navCtrl: NavController,
    public pedometerProvider: PedometerProvider,
    public events: Events
  ) {
    this.dataInterval = Observable.interval(1000);
  }

  start() {
    this.sessionActive = true;
    this.pedometerProvider.start();
    this.dataSubscription = this.dataInterval.subscribe(() => {
      this.sessionData = this.pedometerProvider.sessionData;
    });
  }

  stop() {
    this.sessionActive = false;
    this.pedometerProvider.stop();
    this.dataSubscription.unsubscribe();
    this.sessionData = null;
  }

}
