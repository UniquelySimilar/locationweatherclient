import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {Icon, Style} from 'ol/style';
import axios from 'axios';
import './style.css';
import IconImg from './marker.png';

// Retrieve location and weather data
function retrieveDataRenderMap() {
  var numLocations = document.getElementById('num-select').value;
  axios.get("http://localhost:8080/locationweatherapi/data", {
    params: {
      numLocations: numLocations
    }
  })
  .then(function (response) {
    //console.log(response.data);
    initMap(response.data);
  })
  .catch(function (error) {
    console.log(error);
  })
}

var map = null;
var markerLayer = null;

function initMap(locationWeatherData) {
  if (map == null) {
    map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 0 // max: 28
      })
    });
  }
  
  // Add a markers to map
  if (markerLayer != null) {
    map.removeLayer(markerLayer);
  }

  var iconStyle = new Style({
    image: new Icon({
      src: IconImg,
      scale: 0.05
    })
  });
  
  var featuresAry = [];
  locationWeatherData.forEach(element => {
    let pointAry = [element.coord.lon, element.coord.lat];
    let feature = new Feature({
      geometry: new Point(fromLonLat(pointAry)),
      lon: element.coord.lon,
      lat: element.coord.lat,
      weatherDescription: element.weather[0] !== undefined ? element.weather[0].description : '',
      temp: element.main.temp,
      humidity: element.main.humidity,
      windSpeed: element.wind.speed
    });
    feature.setStyle(iconStyle);
    featuresAry.push(feature);
  });

  markerLayer = new VectorLayer({
    source: new VectorSource({
      features: featuresAry
    })
  });
  map.addLayer(markerLayer);

  // display alert on click
  map.on('click', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature) {
        return feature;
      });
    if (feature) {
      let featureProps = feature.getProperties();
      let message = "LONGITUDE: " + featureProps.lon + "\nLATITUDE: " + featureProps.lat;
      if (featureProps.weatherDescription !== undefined) {
        message += "\nDESCRIPTION: " + featureProps.weatherDescription;
      }
      message += "\nTEMPERATURE: " + featureProps.temp + " F" + "\nHUMIDITY: " + featureProps.humidity + "%" +
                  "\nWIND SPEED: " + featureProps.windSpeed;
      alert(message);
    }
  });
}

(function initHeader() {
  var h3El = document.createElement('h3');
  h3El.appendChild(document.createTextNode('Location Weather'));

  var labelEl = document.createElement('label');
  labelEl.appendChild(document.createTextNode('Select number of locations: '));

  var selectEl = document.createElement('select');
  selectEl.id = 'num-select';
  selectEl.name = 'numLocations';
  
  var fragment = document.createDocumentFragment();
  var optionEl;
  for (var i = 1; i < 21; i++) {
    optionEl = fragment.appendChild(document.createElement('option'));
    optionEl.value = i;
    optionEl.text = i;
  }
  selectEl.appendChild(fragment);
  selectEl.value = 10;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'retrieve-btn';
  btn.appendChild(document.createTextNode('Retrieve/Refresh Map Data'));
  btn.addEventListener('click', retrieveDataRenderMap);

  var headerEl = document.getElementById('header');
  headerEl.appendChild(h3El);
  headerEl.appendChild(labelEl);
  headerEl.appendChild(selectEl);
  headerEl.appendChild(btn);
})();
