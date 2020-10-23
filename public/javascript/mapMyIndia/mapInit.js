var map;
var mapUrl = "https://maps.mapmyindia.com";
var sourceMarker = '',destinyMarker = '';
var sourceCoordinates = {
    lat:25,
    lng:82
};
var destinyCoordinates = {
    lat:17,
    lng:81
};

try{
    map=new MapmyIndia.Map('map',{zoomControl: true,hybrid:true,traffic:true });
}catch(e){
    alert('Please check map key');
}