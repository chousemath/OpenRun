import { Injectable } from '@angular/core';
import { Events, ToastController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';
import { Device } from '@ionic-native/device';
import { Pedometer, IPedometerData } from '@ionic-native/pedometer';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion';
import { AngularFireDatabase } from 'angularfire2/database';
import * as moment from 'moment';

// PEDOMETER DATA
// pedometerData.startDate; -> ms since 1970
// pedometerData.endDate; -> ms since 1970
// pedometerData.numberOfSteps;
// pedometerData.distance;
// pedometerData.floorsAscended;
// pedometerData.floorsDescended;

// GEOLOCATION DATA
// geolocationData.coords.latitude
// geolocationData.coords.longitude

@Injectable()
export class PedometerProvider {
  deviceId: string;
  sessionId: number;
  constructor(
    private toastCtrl: ToastController,
    private insomnia: Insomnia,
    private device: Device,
    private pedometer: Pedometer,
    private geolocation: Geolocation,
    private deviceMotion: DeviceMotion,
    private db: AngularFireDatabase,
    public events: Events
  ) {
    this.deviceId = this.device.uuid;
  }

  start(): void {
    this.insomnia.keepAwake()
      .then(
        () => this.startPedometer(),
        () => console.log('error')
      ).catch(err => console.log('Error with insomenia', err));
  }

  startPedometer(): void {
    this.sessionId = moment().unix();
    this.db
      .database
      .ref(`fitness/devices/${this.deviceId}/sessions/${this.sessionId}`)
      .set({ timestamp: this.sessionId })
      .then(() => {
        this.pedometer.startPedometerUpdates()
          .subscribe((pedometerData: IPedometerData) => {
            const now = moment().unix();
            this.geolocation.getCurrentPosition().then((geolocationData: Geoposition) => {
              // Get the device current acceleration
              this.deviceMotion.getCurrentAcceleration().then(
                (accelerationData: DeviceMotionAccelerationData) => this.savePedometer(now, pedometerData, geolocationData, accelerationData),
                (error: any) => console.log(error)
              );  
            }).catch((err) => console.log('Error getting location', err));
          });
        const toast = this.toastCtrl.create({
          message: 'Pedometer has started!',
          duration: 1500,
          position: 'bottom'
        });
        toast.present();
      })
      .catch(err => console.log(err));
  }

  savePedometer(timestamp: number, pedometerData: IPedometerData, geolocationData: Geoposition, accelerationData: DeviceMotionAccelerationData): void {
    const payload = {
      device: this.deviceId,
      session: this.sessionId,
      timestamp: timestamp,
      pedometer: pedometerData,
      geolocation: geolocationData,
      acceleration: accelerationData
    };
    this.db
      .database
      .ref(`fitness/devices/${this.deviceId}/sessions/${this.sessionId}/${timestamp}`)
      .set(payload)
      .then(() => {
        this.events.publish('data:saved', payload);
      })
      .catch(err => console.log(err));
  }

  stop(): void {
    this.insomnia.allowSleepAgain()
      .then(
        () => this.stopPedometer(),
        (err) => console.log('Error allowing sleep again', err)
      );
  }

  stopPedometer(): void {
    this.pedometer
      .stopPedometerUpdates()
      .then(() => {
        this.events.publish('pedometer:stopped');
        const toast = this.toastCtrl.create({
          message: 'Pedometer has been stopped',
          duration: 1500,
          position: 'bottom'
        });
        toast.present();
      })
      .catch(err => console.log(err));
  }
}
