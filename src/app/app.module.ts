import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation } from '@ionic-native/geolocation';
import { Pedometer } from '@ionic-native/pedometer';
import { Insomnia } from '@ionic-native/insomnia';
import { Device } from '@ionic-native/device';
import { DeviceMotion } from '@ionic-native/device-motion';
import { GoogleMaps } from '@ionic-native/google-maps';
import { Vibration } from '@ionic-native/vibration';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { Shake } from '@ionic-native/shake';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { firebaseConfig } from '../environments/environment';
import { PedometerProvider } from '../providers/pedometer/pedometer';

import { PopoverSelectComponent } from '../components/popover-select/popover-select';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    PopoverSelectComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    PopoverSelectComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Pedometer,
    Insomnia,
    Device,
    DeviceMotion,
    Vibration,
    TextToSpeech,
    Shake,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    PedometerProvider
  ]
})
export class AppModule {}
