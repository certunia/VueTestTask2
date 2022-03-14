<template>
  <div id="app">
    <button
        @click="loadJson"
    >
      loadJson
    </button>
    <button
        @click="start"
    >
      start
    </button>
    <button
        @click="pause"
    >
      pause
    </button>
    <button
        @click="restart"
    >
      restart
    </button>
    <button
        @click="speedUp"
    >
      speed up
    </button>
    <button
        @click="normalSpeed"
    >
      normal speed
    </button>

    <div class="wrap">
      <div
          class="loading-sign"
          v-if="isShowLoad"
      >
        Loading...
      </div>

      <yandex-map
          ymap-class="map_class"
          :coords="camera"
          :marker-fill="{color: '#000000', opacity: 0.4}"
          :zoom="cameraZoom"
      >
        <ymap-marker
            marker-id="1"
            :coords="coords"
            marker-type="Polyline"
        />
        <ymap-marker
            v-if="isShowMarker"
            marker-id="2"
            :coords="camera"
            :icon="markerIcon"
        />
      </yandex-map>
    </div>
  </div>
</template>

<script>
import {yandexMap, ymapMarker} from 'vue-yandex-maps'
import axios from 'axios'

export default {
    components: { yandexMap, ymapMarker },
    data: () => ({
      isPlay: false, // start \ pause
      isShowMarker: false,
      isSpeedUp: false, // x10 speed
      isShowLoad: false,
      coords: [],
      time: [],
      camera: [
        55.750734,
        37.620177
      ], // default camera position
      cameraZoom: 10,
      lastPoint: 0,
      speed: 0,
      markerIcon: {
        layout: 'islands#blueStretchyIcon',
        content: '0',
      },
      settings: {
        apiKey: 'd8c91b1c-6ee5-422b-9210-5ed5aa745ca9',
        lang: 'ru_RU',
        coordorder: 'latlong',
        version: '2.1',
      },
    }),
    methods: {
      loadJson() {
        this.isShowLoad = true;

        axios.get('/coordinates.json')
            .then((response) => {
              this.getData(response.data);
              this.camera = this.coords[0];
              this.isPlay = true;
              this.isShowMarker = true;
              this.isShowLoad = false;
              this.play();
            })
           .catch(() => {
              alert("Couldn't load a file");
           });
      },
      // we have to divide time and coordinates to draw the coords on ymap-marker poliline
      getData(unsorted) {
        this.coords = [];
        this.time = [];
        unsorted.forEach((element) => {
          this.coords.push([element[2],element[1]]);
          this.time.push( element[0] );
        });

        // устанавливаю камеру на первую позицию
        console.log(this.coords[0]);
        this.camera = this.coords[0];
        // this.cameraZoom = 18;
      },
      restart() {
        this.isPlay = true;
        this.lastPoint = 0;
        this.play();
      },
      speedUp() {
        this.isSpeedUp = true;
      },
      normalSpeed() {
        this.isSpeedUp = false;
      },
      start() {
        this.isPlay = true;
        this.play();
      },
      // calculate time, speed and
      play() {
        if (this.isPlay === true) {
          this.camera = this.coords[this.lastPoint];

          var dist = this.distanceCalc(
              this.coords[this.lastPoint][0],
              this.coords[this.lastPoint][1],
              this.coords[this.lastPoint+1][0],
              this.coords[this.lastPoint+1][1]
          );
          this.lastPoint = this.lastPoint + 1;
          this.cameraZoom = 18;

          var since = new Date ( this.time[this.lastPoint - 1] );
          var now   = new Date ( this.time[this.lastPoint]     );
          var res = new Date ( now - since );
          this.speed = this.speedCalc(dist, res.getSeconds());
          var timeSpeed = res.getSeconds();

          if (this.isSpeedUp) {
            timeSpeed=timeSpeed/10; // x10 speed
          }

          setTimeout(() => {
            return this.play();
          }, timeSpeed * 1000);
        }
        else {
          return false;
        }
      },
      pause() {
        this.isPlay = false;
      },

      speedCalc(dist,time) {
        time = time / 60 / 60;
        this.speed = dist / time;
        this.markerIcon.content = Math.round(dist / time);
      },
      distanceCalc(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2radCalc(lat2-lat1);  // deg2radCalc below
        var dLon = this.deg2radCalc(lon2-lon1);
        var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2radCalc(lat1)) * Math.cos(this.deg2radCalc(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        // Distance in km
        return R * c;
      },
      // recalculate to radiants
      deg2radCalc(deg) {
        return deg * (Math.PI/180)
      },
    },
  }
</script>

<style>
.loading-sign {
  font-size: 20px;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%,-50%);
  z-index: 1;
}

.map_class {
  height: 90vh;
  width: 100%;
}

.wrap {
  height: 100%;
  position: relative;
  width: 100%;
}
</style>