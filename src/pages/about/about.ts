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
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
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
    public device: Device,
    private geolocation: Geolocation
  ) {
  }

  ionViewDidLoad() { this.loadMap(); }
  ionViewDidUnload() { this.map.remove(); }

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
  }

  renderPoints() {
    this.points$ = this.db
      .list(`fitness/devices/${this.device.uuid}/sessions`, ref => ref.limitToLast(1))
      .valueChanges()
      .subscribe((sessions: any) => {
        this.points = _.values(_.values(sessions)[0].data);
        const bounds = _.map(this.points, p => {
          return { lat: p.geolocation.latitude, lng: p.geolocation.longitude };
        });
        this.map.moveCamera({ target: bounds, tilt: 30, zoom: 18 });
        this.map.addPolyline({
          points: bounds,
          visible: true,
          geodesic: true,
          width: 2,
          color: '#ff0f80'
        });
      });
  }

}
