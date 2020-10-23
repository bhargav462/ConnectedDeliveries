 
function AddressAutoComplete()
{ 
    
    var corsUrl = 'https://cors-anywhere.herokuapp.com/';

    var inputReference;
    var authToken = "";
    var datalistId = "";
    var type = '';

    function init(reference,listId,t)
    { 
      inputReference = reference;
      datalistId = listId;
      type = t;
    }

    function addressSuggestion()
    {
       var query = inputReference.value;
       var autocompleteUrl = corsUrl + "https://atlas.mapmyindia.com/api/places/search/json?query=" + `"${query}"`;
       console.log('authToken',authToken);
       fetch(autocompleteUrl,{
           headers: {
                 'Content-Type': 'application/json',
                 'Authorization': authToken
                }
       }).then(res => {
           console.log(res);
           if(res.ok)
           {
               return res.json();
           }
       })
       .then(data => {
           console.log('resultData',data);
           
           addDatalist(data);
       });
    }    

    function setAuthToken(token){
        authToken = token;
        console.log('to',authToken);
    }

    function addDatalist(address){
        if(!address)
        return;

        var temp = address.suggestedLocations;
        var custom = `<datalist id="${datalistId}">`
        var newCoords = {
            lat: 0,
            lng: 0
        };
        temp.forEach((element,index) => {
            if(index === 0)
            {
                if(type === "source"){
                    sourceCoordinates.lat = element.latitude;
                    sourceCoordinates.lng = element.longitude;
                }else{
                    destinyCoordinates.lat = element.latitude;
                    destinyCoordinates.lng = element.longitude;
                }
               newCoords.lat = element.latitude;
               newCoords.lng = element.longitude;
               console.log('newCoords',newCoords)
               console.log('mapRouting',mapRouting);
               mapRouting.show_markers(type,newCoords);
               mapRouting.get_route_result();
               console.log('markerType',type);
               console.log('showMarker');
            }
            custom += `<option value='${element.placeAddress}, ${element.placeName}'></option>`;
        })

        if(temp.length === 0)
        {
          custom += `<option value="No data found"></option>`;
        }

        custom += '</datalist>';

        inputReference.innerHTML = custom;
    }

    return Object.freeze({
        init,
        addressSuggestion,
        setAuthToken
    })
}