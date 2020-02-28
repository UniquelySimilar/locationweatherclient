import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
//import XYZSource from 'ol/source/XYZ';
import {fromLonLat} from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import axios from 'axios';

// Retrieve location and weather data
const numLocations = 10;
axios.get("http://localhost:8080/locationweatherapi/data", {
    params: {
      numLocations: numLocations
    }
  })
  .then(function (response) {
    console.log(response.data);
    initMap(response.data);
  })
  .catch(function (error) {
    console.log(error);
  })

function initMap(locationWeatherData) {
  var lon = locationWeatherData[0].coord.lon;
  var lat = locationWeatherData[0].coord.lat;
  console.log("lon: " + lon + ", lat: " + lat);
  var center = [lon, lat];
  //var center = [-105.13, 39.98];
  var map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM()
        // source: new XYZSource({
        //   url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
        // })
      })
    ],
    view: new View({
      center: fromLonLat(center),
      zoom: 0 // max: 28
    })
  });
  
  // Add a marker to map
  var layer = new VectorLayer({
    source: new VectorSource({
        features: [
            new Feature({
                geometry: new Point(fromLonLat(center))
            })
        ]
    })
  });
  map.addLayer(layer);
  }

//const view = map.getView();
// console.log("Map size: " + map.getSize());
// console.log("Map center: " + view.getCenter());
// console.log("Max zoom: " + view.getMaxZoom());
