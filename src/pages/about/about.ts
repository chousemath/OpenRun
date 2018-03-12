import { Component, ViewChild } from '@angular/core';
import { NavController, PopoverController } from 'ionic-angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker
 } from '@ionic-native/google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { AngularFireDatabase } from 'angularfire2/database';
import { Device } from '@ionic-native/device';
import { Shake } from '@ionic-native/shake';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import { PopoverSelectComponent } from '../../components/popover-select/popover-select';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  map: GoogleMap;
  points$: Subscription;
  points: Array<any>;
  bounds: Array<{ lat: number, lng: number }> = [];
  firstRender: boolean;
  shake$: Subscription;
  sessions: Array<any> = [];
  constructor(
    public navCtrl: NavController,
    public db: AngularFireDatabase,
    public device: Device,
    public popoverCtrl: PopoverController,
    private geolocation: Geolocation,
    private shake: Shake
  ) {
  }

  ionViewDidLoad() { this.loadMap(); }
  ionViewDidUnload() {
    this.map.remove();
    this.points$.unsubscribe();
    this.shake$.unsubscribe();
  }

  loadMap() {
    this.geolocation.getCurrentPosition().then((geolocationData) => {
      let mapOptions: GoogleMapOptions = {
        camera: {
          target: {
            lat: geolocationData.coords.latitude,
            lng: geolocationData.coords.longitude
          },
          zoom: 18,
          tilt: 30
        }
      };
      this.map = GoogleMaps.create('map', mapOptions);
      this.map
        .one(GoogleMapsEvent.MAP_READY)
        .then(() => this.renderPoints());
    }).catch((err) => console.log('Error getting location', err));

    this.shake$ = this.shake.startWatch(60).subscribe(() => {
      this.refreshMap();
    });
  }

  renderPoints() {
    if (this.points$) {
      this.points$.unsubscribe();
      this.points$ = null;
    }
    this.firstRender = true;
    this.points$ = this.db
      .list(`fitness/devices/${this.device.uuid}/sessions`)
      .valueChanges()
      .subscribe((sessions: any) => {
        this.sessions = _.map(sessions, s => {
          return {
            timestamp: s.timestamp,
            data: _.values(s.data)
          }
        });
        _.reverse(this.sessions);
        this.points = this.sessions[0].data;
        this.bounds = _.map(this.points, p => {
          return { lat: p.geolocation.latitude, lng: p.geolocation.longitude };
        });
        if (this.firstRender) {
          this.firstRender = false;
          this.refreshMap();
        }
      });
  }

  refreshMap() {
    this.map.moveCamera({ target: this.bounds, tilt: 30, zoom: 18 });
    this.map.addPolyline({
      points: this.bounds,
      visible: true,
      geodesic: true,
      width: 2,
      color: '#ff0f80'
    });
  }

  getLatestMap() {
    this.renderPoints();
  }

  showSessions() {
    const popover = this.popoverCtrl.create(PopoverSelectComponent, {
      sessions: this.sessions
    });
    popover.onDidDismiss(session => {
      if (session) {
        this.points$.unsubscribe();
        this.points = session.data;
        this.bounds = _.map(this.points, p => {
          return { lat: p.geolocation.latitude, lng: p.geolocation.longitude };
        });
        this.refreshMap();
      }
    });
    popover.present();
  }

}
