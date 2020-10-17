
var findRouteObject;

var bubble;

function openBubble(position, text){
 if(!bubble){
    bubble =  new H.ui.InfoBubble(
      position,
      // The FO property holds the province name.
      {content: text});
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}

class FindRoute{
    calculateRouteFromAtoB (platform) {
          var router = platform.getRoutingService(null, 8),
              routeRequestParams = {
                routingMode: 'fast',
                transportMode: 'car',
                origin: `${startMarker.getGeometry().lat},${startMarker.getGeometry().lng}`, // Brandenburg Gate
                destination: `${endMarker.getGeometry().lat},${endMarker.getGeometry().lng}`,  // Friedrichstraße Railway Station
                return: 'polyline,turnByTurnActions,actions,instructions,travelSummary,passthrough',
                alternatives: 3
              };

          findRouteObject = this;
        
          router.calculateRoute(
            routeRequestParams,
            findRouteObject.onSuccess,
            findRouteObject.onError
          );
    }
    
    onSuccess(result) {
  
        console.log('no of routes',result.routes.length);
       
       var i = 0;
       result.routes.forEach((route) => {
        findRouteObject.addRouteShapeToMap(route,i);
        findRouteObject.addManueversToMap(route);
        i++;
       })
        
    }

   ChangeColorOfRemaining(objectId)
   {
    for(object of map.getObjects())
    {
        if(objectId !== object.id && object.class === "route" && object.style.lineWidth === 8)
        {

            var route = "";

            for(var i = 0; i < polygonsArray.length; i++)
            {
              if(polygonsArray[i].id === object.id){
                  route = polygonsArray[i].route;
                  break;
              }
            }

            if(route !== "")
            route.sections.forEach((section) => {
            // decode LineString from the flexible polyline
            let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
        
            // Create a polyline to display the route:
            let polyline = new H.map.Polyline(linestring, {
                style: {
                lineWidth: 4,
                strokeColor: colors.nextColor()
                }
            });
            
            polyline.id = object.id;
            polyline.class = "route";
        
            polyline.addEventListener('tap',chooseMap)
        
            // Add the polyline to the map
            map.removeObject(object);

            map.addObject(polyline);
            // And zoom to its bounding rectangle
            });

        }
      }
    }

    chooseMap(evt){

        for(object of map.getObjects()){
            if(object.id === evt.target.id)
            {
      
              var route = "";
      
              for(var i = 0; i < polygonsArray.length; i++)
              {
                if(polygonsArray[i].id === evt.target.id){
                  route = polygonsArray[i].route;
                  polygonsArray[i].colorMap = 0;
                  break;
                }
              }
      
              findRouteObject.ChangeColorOfRemaining(object.id);
      
              route.sections.forEach((section) => {
                // decode LineString from the flexible polyline
                let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
            
                // Create a polyline to display the route:
                let polyline = new H.map.Polyline(linestring, {
                  style: {
                    lineWidth: 8,
                    strokeColor: 'rgb(0, 0, 0)'
                  }
                });
                
                polyline.id = object.id;
                polyline.class = "route";
          
                polyline.addEventListener('tap',findRouteObject.chooseMap)
          
                // Add the polyline to the map
                map.removeObject(object);
                map.addObject(polyline);
                // And zoom to its bounding rectangle
              });
            }
        }
    }

    addRouteShapeToMap(route,i){
        polygonsArray.push({route:route,id:"route"+i,colorMap:1});
        route.sections.forEach((section) => {
          // decode LineString from the flexible polyline
          let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
      
          // Create a polyline to display the route:
          let polyline = new H.map.Polyline(linestring, {
            style: {
              lineWidth: 4,
              strokeColor: colors.nextColor()
            }
          });
          
          polyline.id = "route" + i;
          polyline.class = "route";
    
          polyline.addEventListener('tap',findRouteObject.chooseMap)
    
          // Add the polyline to the map
          map.addObject(polyline);
          // And zoom to its bounding rectangle
          map.getViewModel().setLookAtData({
            bounds: polyline.getBoundingBox()
          });
        });
      }
    
      addManueversToMap(route){
        var svgMarkup = '<svg width="18" height="18" ' +
          'xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="8" cy="8" r="8" ' +
            'fill="#1b468d" stroke="white" stroke-width="1"  />' +
          '</svg>',
          dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}}),
          group = new  H.map.Group(),
          i,
          j;
        route.sections.forEach((section) => {
          let poly = H.geo.LineString.fromFlexiblePolyline(section.polyline).getLatLngAltArray();
      
          let actions = section.actions;
          // Add a marker for each maneuver
          for (i = 0;  i < actions.length; i += 1) {
            let action = actions[i];
            var marker =  new H.map.Marker({
              lat: poly[action.offset * 3],
              lng: poly[action.offset * 3 + 1]},
              {icon: dotIcon});
            marker.instruction = action.instruction;
            group.addObject(marker);
          }
      
          group.addEventListener('tap', function (evt) {
            map.setCenter(evt.target.getGeometry());
            openBubble(
               evt.target.getGeometry(), evt.target.instruction);
          }, false);
    
          // group.id="route"+i;
          group.class  = "routeGroup";
      
          // Add the maneuvers group to the map
          map.addObject(group);
        });
      }
    
      onError(error) {
        alert('Can\'t reach the remote server');
      }
    

}