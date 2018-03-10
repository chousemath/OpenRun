import { Injectable } from '@angular/core';
import { Events, ToastController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';
import { Device } from '@ionic-native/device';
import { Pedometer, IPedometerData } from '@ionic-native/pedometer';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion';
import { Vibration } from '@ionic-native/vibration';
import { AngularFireDatabase } from 'angularfire2/database';
import * as moment from 'moment';
import * as _ from 'lodash';

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
  mark250: boolean = false;
  mark500: boolean = false;
  mark1000: boolean = false;
  mark2500: boolean = false;
  mark5000: boolean = false;
  mark7500: boolean = false;
  mark10000: boolean = false;
  constructor(
    private toastCtrl: ToastController,
    private insomnia: Insomnia,
    private device: Device,
    private pedometer: Pedometer,
    private geolocation: Geolocation,
    private deviceMotion: DeviceMotion,
    private vibration: Vibration,
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
            _.forEach([250, 500, 1000, 2500, 5000, 7500, 10000], num => {
              if (pedometerData.numberOfSteps > num && !this[`mark${num}`]) this.vibrateAndToast(num);
            });
            const now = moment().unix();
            this.geolocation.getCurrentPosition().then((geolocationData) => {
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
    const geolocationPoint = {
      latitude: geolocationData.coords.latitude,
      longitude: geolocationData.coords.longitude,
      accuracy: geolocationData.coords.accuracy,
      altitude: geolocationData.coords.altitude,
      altitudeAccuracy: geolocationData.coords.altitudeAccuracy,
      speed: geolocationData.coords.speed
    };
    console.log('geolocationPoint', geolocationPoint);
    const payload = {
      device: this.deviceId,
      session: this.sessionId,
      timestamp: timestamp,
      pedometer: pedometerData,
      geolocation: geolocationPoint,
      acceleration: accelerationData
    };
    this.db
      .database
      .ref(`fitness/devices/${this.deviceId}/sessions/${this.sessionId}/data/${timestamp}`)
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
        this.mark250 = false;
        this.mark500 = false;
        this.mark1000 = false;
        this.mark2500 = false;
        this.mark5000 = false;
        this.mark7500 = false;
        this.mark10000 = false;
      })
      .catch(err => console.log(err));
  }

  vibrateAndToast(num: number): void {
    this.vibration.vibrate([500, 200, 500]);
    const toast = this.toastCtrl.create({
      message: `Reached ${num} steps!`,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
    this[`mark${num}`] = true;
  }
}
