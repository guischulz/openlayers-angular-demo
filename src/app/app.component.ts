import { Component } from '@angular/core';
import Map from 'ol/Map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public onMapReady(_event: Map) {
    console.log('Map Ready');
  }
}
