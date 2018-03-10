import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker
 } from '@ionic-native/google-maps';
 import { AngularFireDatabase } from 'angularfire2/database';
import { Device } from '@ionic-native/device';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  map: GoogleMap;
  points$: Subscription;
  points: Array<any>;
  constructor(
    public navCtrl: NavController,
    public db: AngularFireDatabase,
    public device: Device
  ) {
  }

  ionViewDidLoad() {
    this.loadMap();
    console.log('trying to load map');
  }

  loadMap() {
    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: 43.0741904,
          lng: -89.3809802
        },
        zoom: 18,
        tilt: 30
      }
    };

    this.map = GoogleMaps.create('map', mapOptions);

    // Wait the MAP_READY before using any methods.
    this.map
      .one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        this.renderPoints();
      });
  }

  renderPoints() {
    this.points$ = this.db
      .list(`fitness/devices/${this.device.uuid}/sessions`, ref => ref.limitToLast(1))
      .valueChanges()
      .subscribe((sessions: any) => {
        this.points = _.values(_.values(sessions)[0].data);
        _.forEach(this.points, p => {
          this.map.addMarker({
            icon: 'red',
            animation: 'DROP',
            position: { lat: p.geolocation.latitude, lng: p.geolocation.longitude }
          });
        });
        const bounds = _.map(this.points, p => {
          return {
            lat: p.geolocation.latitude,
            lng: p.geolocation.longitude
          };
        });
        this.map.moveCamera({
          target: bounds,
          tilt: 60,
          zoom: 18
        });
        this.map.addPolyline({
          points: bounds,
          visible: true,
          geodesic: true,
          width: 2,
          color: '#40e0d0'
        });
      });
  }

}
