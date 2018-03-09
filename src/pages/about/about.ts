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

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  map: GoogleMap;
  constructor(public navCtrl: NavController) {
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

        this.map.addMarker({
          icon: 'red',
          animation: 'DROP',
          position: { lat: 43.0741904, lng: -89.3809802 }
        });

      });
  }

}
