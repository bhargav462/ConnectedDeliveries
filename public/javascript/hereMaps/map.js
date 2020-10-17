/**
 * Restricts a moveable map to a given rectangle.
 *
 * @param {H.Map} map   A HERE Map instance within the application
 *
 */

var startMarker;
var endMarker; 
var polygonsArray = [];
var findRoute = new FindRoute();

var nearByPlaces = [{
   lat: '16.5062', lng: '80.6390'
},{
   lat: '16.4062', lng: '80.6780'
},{
   lat: '16.5082', lng: '80.6580'
},{
   lat: '16.5162', lng: '80.6440'
},{
   lat: '16.4892', lng: '80.6490'
}]

var colors = {
    colorIndex: 0,
    color: [
    'rgb(252, 5, 5)',
    'rgb(191, 252, 5)',
    'rgb(5, 92, 252)',
    'rgb(252, 5, 92)',
    'rgb(120,12,211)'
    ],
    nextColor:function() {
       this.colorIndex++;
       this.colorIndex = this.colorIndex%this.color.length;
       return this.color[this.colorIndex];
    },
};

function addMarkersToMap(map) {

  startMarker = new H.map.Marker({lat:31.3959, lng:75.5359},{
    volatility:true
  });

  startMarker.draggable = true;

  map.addObject(startMarker)
  
  endMarker = new H.map.Marker({lat:17, lng:81},{
      volatility:true
  });

  endMarker.draggable = true;

  map.addObject(endMarker);

    map.addEventListener('dragstart', function(ev) {
        var target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
          var targetPosition = map.geoToScreen(target.getGeometry());
          target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
          behavior.disable();
        }
      }, false);
    
    
      // re-enable the default draggability of the underlying map
      // when dragging has completed
      map.addEventListener('dragend', function(ev) {
        var target = ev.target;
        if (target instanceof H.map.Marker) {
          behavior.enable();
        }
      }, false);
    
      // Listen to the drag event and move the position of the marker
      // as necessary
       map.addEventListener('drag', function(ev) {
        var target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
          target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
        }
      }, false);
}


/**
 * Boilerplate map initialization code starts below:
 */

var APIKEY = "hPdu5ukCOA7P4-9Ui1lHAQ0lc7CTt746JSPuCY0tBg8"; 

//Step 1: initialize communication with the platform
// In your own code, replace variable window.apikey with your own apikey
var platform = new H.service.Platform({
  apikey: "hPdu5ukCOA7P4-9Ui1lHAQ0lc7CTt746JSPuCY0tBg8"
});

var defaultLayers = platform.createDefaultLayers();
var geocoder = platform.getGeocodingService();
var group = new H.map.Group();

//Step 2: initialize a map - this map is centered over Alcatraz Island
var routeInstructionsContainer = document.getElementById('panel');
var map = new H.Map(document.getElementById('map'),
  defaultLayers.vector.normal.map,{
  center: {lat:17, lng:83},
  zoom: 5,
  pixelRatio: window.devicePixelRatio || 1
});


// add a resize listener to make sure that the map occupies the whole container
window.addEventListener('resize', () => map.getViewPort().resize());

//Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Step 4: Create the default UI:
var ui = H.ui.UI.createDefault(map, defaultLayers, 'en-US');

Number.prototype.toMMSS = function () {
    return  Math.floor(this / 60)  +' minutes '+ (this % 60)  + ' seconds.';
  }

  addMarkersToMap(map);

function removeObjectByClass(id){

    for (object of map.getObjects()){
      if (object.class===id || object.class === "routeGroup"){

        map.removeObject(object);

        }
      }
      polygonsArray = [];
}

document.getElementById("getRoute").onclick = function(ev){
    removeObjectByClass("route");
    findRoute.calculateRouteFromAtoB (platform);
}





