import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  Output
} from '@angular/core';
import { defaults as olGetDefaultControls, ScaleLine } from 'ol/control';
import { Coordinate } from 'ol/coordinate';
import TileLayer from 'ol/layer/Tile';
import Map from 'ol/Map';
import { get as olGetProjection, transformWithProjections } from 'ol/proj';
import { register as olRegisterProj4Projection } from 'ol/proj/proj4';
import Projection from 'ol/proj/Projection';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import * as _proj4 from 'proj4';
let proj4 = (_proj4 as any).default; // Workaround for proj4, cf. https://github.com/DefinitelyTyped/DefinitelyTyped/issues/15663

const WGS84_PROJECTION = olGetProjection('EPSG:4326');
const WEB_MERCATOR_PROJECTION = olGetProjection('EPSG:3857');

@Component({
  selector: 'app-ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.css'],
})
export class OlMapComponent implements AfterViewInit {
  @Input() center: Coordinate; // WGS 84 Longitude, Latitude
  @Input() zoom: number;
  view: View;
  projection: Projection;
  Map: Map;
  @Output() mapReady = new EventEmitter<Map>();

  constructor(private zone: NgZone, private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    if (!this.Map) {
      this.zone.runOutsideAngular(() => this.initMap());
    }
    setTimeout(() => this.mapReady.emit(this.Map));
  }

  private initMap(): void {
    // OpenLayers includes definitions for EPSG:4326 and EPSG:3857
    // Additional projections can be defined in proj4 and then registered in OpenLayers
    proj4.defs([
      [
        'EPSG:3857',
        '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
      ],
      [
        'EPSG:25832',
        '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
      ],
    ]);
    olRegisterProj4Projection(proj4);

    this.projection = WEB_MERCATOR_PROJECTION;
    this.view = new View({
      center: this.transformWGS84Coordinate(this.center),
      zoom: this.zoom,
      projection: this.projection,
    });
    this.Map = new Map({
      layers: [
        new TileLayer({
          source: new OSM({}),
        }),
      ],
      target: 'map',
      view: this.view,
      controls: olGetDefaultControls().extend([new ScaleLine({})]),
    });
  }

  private transformWGS84Coordinate(coordinate: Coordinate) {
    return transformWithProjections(
      coordinate,
      WGS84_PROJECTION,
      this.projection
    );
  }
}
