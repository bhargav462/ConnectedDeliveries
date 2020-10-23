function MapRouting()
{

    var possibleRoutes = new Array();
        
    var corsUrl = 'https://cors-anywhere.herokuapp.com/';
    var routeApiUrl = 'https://apis.mapmyindia.com/advancedmaps/v1/qqymz4ot4hy44z1xfb2oz1ipuheuhjsj/route_adv/driving/';
    var selectedPath = [];
    var leaflet_group=[];

    function init()
    {
        get_route_result();
    }

    function show_markers(marker_name, points)
        {
            if(points === {})
            return;
            console.log('points',points);

            var show_marker;
            var pos = new L.LatLng(points.lat, points.lng);
            var title;
            var icon_marker='';
            console.log('marker_name',marker_name);
            if (marker_name === 'source') {
                var title = "Start Point";
                if(sourceMarker !== ''){
                   map.removeLayer(sourceMarker);
                }
                console.log('source');
                icon_marker = L.icon({iconUrl: mapUrl + '/images/3.png', iconRetinaUrl: mapUrl +'/images/3.png', popupAnchor: [-3, -15]});
            } else {
                if(destinyMarker !== '')
                {
                    map.removeLayer(destinyMarker);
                }
                var title = "Destination Point";
            }
            /****marker display, for more about marker, please refer our marker documentation****/
            if (icon_marker !== '')
                show_marker = new L.marker(pos, { draggable: 'true',icon:icon_marker, title: title}).addTo(map);
            else
                show_marker = new L.marker(pos, { draggable: 'true', title: title}).addTo(map);

            if(marker_name === 'source'){
                sourceMarker = show_marker;
            }else{
                destinyMarker = show_marker;
            }

            show_marker.bindPopup(title, {closeButton: true, autopan: true, zoomAnimation: true}).openPopup();

            show_marker.on('dragend', function (event) {
                var marker = event.target;
                var position = marker.getLatLng();
                if(marker_name === 'source')
                {
                    sourceCoordinates.lat = marker.getLatLng().lat;
                    sourceCoordinates.lng = marker.getLatLng().lng;
                }else{
                    destinyCoordinates.lat = marker.getLatLng().lat;
                    destinyCoordinates.lng = marker.getLatLng().lng;
                }
                get_route_result();
                console.log(position);
                console.log(marker.options.title);
            });
        }

        function get_route_result()
        {
            if(sourceMarker !== '')
            {
                map.removeLayer(sourceMarker);
                map.removeLayer(destinyMarker);
                leaflet_group.forEach(element => {
                    map.removeLayer(element);
                })
                leaflet_group = new Array();
                possibleRoutes = new Array();
            }

           show_markers("source",sourceCoordinates);
           show_markers("destiny",destinyCoordinates);
           var finalURL = `${corsUrl}${routeApiUrl}${sourceCoordinates.lng},${sourceCoordinates.lat};${destinyCoordinates.lng},${destinyCoordinates.lat}?alternatives=true&rtype=0&geometries=polyline&overview=full&exclude=&steps=true&region=ind`;

           console.log(finalURL);
            
           fetch(finalURL).then(res => {
               if(res.ok)
               {
                   return res.json();
               }
               return res.json();
           }).then(result => {
               console.log('result',result);
               
                   leaflet_group.forEach(element => {
                       map.removeLayer(element);
                   });
               
                   console.log(sourceMarker,destinyMarker)
               
               route_api_result(result);
           })
        }

        function route_api_result(data)
        {
           for(i = 0; i < data.routes.length; i++)
           {
             var geometry=decode(data.routes[i].geometry);
             possibleRoutes.push(geometry);
             
             if(i === 0)
             selectedPath = geometry;

             var color="#a9b6c4";
             if(i>0) color="#016f99";

             leaflet_group[i]=new L.Polyline(geometry, {weight: 7, opacity: 1, color: color, smoothFactor: 1, title: i});
             map.addLayer(leaflet_group[i]);

             leaflet_group[i].on("click",function(e){

                 const index = e.target.options.title;
                 console.log(typeof index,index);
                 map.removeLayer(leaflet_group[index]);
                 leaflet_group[index] = new L.Polyline(possibleRoutes[index], {weight: 7, opacity: 1, color: "#a9b6c4", smoothFactor: 1, title: index})
               
                    possibleRoutes.forEach(function(route,i){
                        if(i != index)
                        {
                            map.removeLayer(leaflet_group[i]);
                            leaflet_group[i] = new L.Polyline(possibleRoutes[i], {weight: 7, opacity: 1, color: "#016f99", smoothFactor: 1, title: i})
                            map.addLayer(leaflet_group[i]);
                            addPolygonLayer(leaflet_group,i);
                        }
                        selectedPath = possibleRoutes[i];
                    })
                    
                 map.addLayer(leaflet_group[index]);
                 addPolygonLayer(leaflet_group,index);
             })
           }
        }

        function addPolygonLayer(leaflet_group,num)
        {
            leaflet_group[num].on("click",function(e){

                 const index = e.target.options.title;
                 console.log(typeof index,index);
                 map.removeLayer(leaflet_group[index]);
                 leaflet_group[index] = new L.Polyline(possibleRoutes[index], {weight: 7, opacity: 1, color: "#a9b6c4", smoothFactor: 1, title: index})
                
                 possibleRoutes.forEach(function(route,i){
                    if(i != index)
                    {
                        map.removeLayer(leaflet_group[i]);
                        leaflet_group[i] = new L.Polyline(possibleRoutes[i], {weight: 7, opacity: 1, color: "#016f99", smoothFactor: 1, title: i})
                        map.addLayer(leaflet_group[i]);
                        addPolygonLayer(leaflet_group,i);
                    }
                    selectedPath = possibleRoutes[i];
                 })
                
                 map.addLayer(leaflet_group[index]);
                 addPolygonLayer(leaflet_group,index);

             })
        }

        function decode(encoded) 
        {
            var points = [];
            var index = 0, len = encoded.length;
            var lat = 0, lng = 0;
            while (index < len) {
                var b, shift = 0, result = 0;
                do {

                    b = encoded.charAt(index++).charCodeAt(0) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);


                var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
                lat += dlat;
                shift = 0;
                result = 0;
                do {
                    b = encoded.charAt(index++).charCodeAt(0) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
                lng += dlng;

                points.push([lat / 1E5, lng / 1E5])


            }
            return points
        } 

        function getSelectedPath()
        {
            return selectedPath;
        }

        return Object.freeze({
            init,
            show_markers,
            get_route_result,
            selectedPath,
            getSelectedPath
        })

}