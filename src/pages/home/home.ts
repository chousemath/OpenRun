import { Component } from '@angular/core';
import { Events, NavController } from 'ionic-angular';
import { PedometerProvider } from '../../providers/pedometer/pedometer';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  sessionActive = false;
  sessionData: any;
  constructor(
    public navCtrl: NavController,
    public pedometerProvider: PedometerProvider,
    public events: Events
  ) {
    events.subscribe('data:saved', payload => {
      this.sessionActive = true;
      this.sessionData = payload;
    });

    events.subscribe('pedometer:stopped', payload => {
      this.sessionActive = false;
    });
  }

  start() {
    this.pedometerProvider.start();
  }

  stop() {
    this.pedometerProvider.stop();
  }

}
