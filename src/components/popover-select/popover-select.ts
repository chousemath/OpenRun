import { Component } from '@angular/core';
import { ViewController, NavParams} from 'ionic-angular';
import * as moment from 'moment';

@Component({
  selector: 'popover-select',
  templateUrl: 'popover-select.html'
})
export class PopoverSelectComponent {
  sessions: Array<any> = [];
  constructor(
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    this.sessions = this.navParams.get('sessions');
  }

  formatTimestamp(timestamp: number): string {
    return moment(timestamp).format('llll')
  }

  dismiss(session) {
    this.viewCtrl.dismiss(session);
  }

}
