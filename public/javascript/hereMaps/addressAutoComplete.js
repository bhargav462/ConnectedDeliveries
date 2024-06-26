var bubble;

group.addEventListener('tap', function (evt) {
    map.setCenter(evt.target.getGeometry());
    console.log('check',evt.target.getGeometry(),evt.target.getData());
    openBubble(
        evt.target.getGeometry(), evt.target.getData());
}, false);

map.addObject(group);

function openBubble(position, text){
    if(!bubble){
        bubble =  new H.ui.InfoBubble(
            position,
            // The FO property holds the province name.
            {content: '<small>' + text+ '</small>'});
        ui.addBubble(bubble);
    } else {
        bubble.setPosition(position);
        bubble.setContent('<small>' + text+ '</small>');
        bubble.open();
    }
}

// class AddressAutoComplete
function AddressAutoComplete(){

    var AUTOCOMPLETION_URL;
    var ajaxRequest;
    var query;
    var addressSuggestion;
    var marker;
    var datalistId;

    function init(reference,markerReference,dId){

        addressSuggestion = reference;
        marker = markerReference;
        datalistId = dId;

        AUTOCOMPLETION_URL = 'https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json';
        ajaxRequest = new XMLHttpRequest();
        query = '';

        // console.log('ajaxRequest',ajaxRequest)

        ajaxRequest.addEventListener("load", onAutoCompleteSuccess);
        ajaxRequest.addEventListener("error", onAutoCompleteFailed);
        ajaxRequest.responseType = "json";
    }

    function onAutoCompleteSuccess() {
        /*
         * The styling of the suggestions response on the map is entirely under the developer's control.
         * A representitive styling can be found the full JS + HTML code of this example
         * in the functions below:
         */
        clearOldSuggestions();
        addSuggestionsToPanel(this.response);  // In this context, 'this' means the XMLHttpRequest itself.
        addSuggestionsToMap(this.response);
    }
    
    /**
     *  This is the event listener which processes the XMLHttpRequest response returned from the server.
     */
    function onAutoCompleteFailed() {
        alert('Ooops!');
    }

     /**
     * Removes all H.map.Marker points from the map and adds closes the info bubble
     */
    function clearOldSuggestions(){
        group.removeAll();
        if(bubble){
            bubble.close();
        }
    }

    /**
 * The Geocoder Autocomplete API response retrieves a complete addresses and a `locationId`.
 * for each suggestion.
 *
 * You can subsequently use the Geocoder API to geocode the address based on the ID and
 * thus obtain the geographic coordinates of the address.
 *
 * For demonstration purposes only, this function makes a geocoding request
 * for every `locationId` found in the array of suggestions and displays it on the map.
 *
 * A more typical use-case would only make a single geocoding request - for example
 * when the user has selected a single suggestion from a list.
 *
 * @param {Object} response
 */
   function addSuggestionsToMap(response){
    /**
     * This function will be called once the Geocoder REST API provides a response
     * @param  {Object} result          A JSONP object representing the  location(s) found.
     */
    var onGeocodeSuccess = function (result) {

            var locations = result.Response.View[0].Result,
                i;
                


            // Add a marker for each location found
            for (i = 0; i < locations.length; i++) {
                    marker.setGeometry({lat: locations[i].Location.DisplayPosition.Latitude,
                        lng : locations[i].Location.DisplayPosition.Longitude
                    })
                    marker.setData(locations[i].Location.Address.Label);
                    // group.addObject(marker);    
            }

        },
        /**
         * This function will be called if a communication error occurs during the JSON-P request
         * @param  {Object} error  The error message received.
         */
        onGeocodeError = function (error) {
            alert('Ooops!');
        },
        /**
         * This function uses the geocoder service to calculate and display information
         * about a location based on its unique `locationId`.
         *
         * A full list of available request parameters can be found in the Geocoder API documentation.
         * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-search.html
         *
         * @param {string} locationId    The id assigned to a given location
         */
        geocodeByLocationId = function (locationId) {
            var geocodingParameters = {
                locationId : locationId
            };

            geocoder.geocode(
                geocodingParameters,
                onGeocodeSuccess,
                onGeocodeError
            );
        }

    /*
     * Loop through all the geocoding suggestions and make a request to the geocoder service
     * to find out more information about them.
     */

    response.suggestions.forEach(function (item, index, array) {
        if(index !== 0)
        return;
        geocodeByLocationId(item.locationId);
      });
    }

    /**
     * Format the geocoding autocompletion repsonse object's data for display
     *
     * @param {Object} response
     */
    function addSuggestionsToPanel(response){

        // var addressSuggestion = document.getElementById("addressSuggestion");

        // console.log('beforeCheck',addressSuggestion.innerHTML);

        var addressDataListContent = `<datalist id="${datalistId}">`;
        
        response.suggestions.forEach(function(result){
            addressDataListContent += `<option data-value="${result.label}">${result.label}`;
        })
        addressDataListContent += '</datalist>';

        addressSuggestion.innerHTML = addressDataListContent;

        // console.log('check',addressSuggestion.innerHTML);
    }

    function autoCompleteListener(textBox, event) {

        if (query != textBox.value){
            if (textBox.value.length >= 1){
    
                /**
                 * A full list of available request parameters can be found in the Geocoder Autocompletion
                 * API documentation.
                 *
                 */
                var params = '?' +
                    'query=' +  encodeURIComponent(textBox.value) +   // The search text which is the basis of the query
                    '&beginHighlight=' + encodeURIComponent('<mark>') + //  Mark the beginning of the match in a token.
                    '&endHighlight=' + encodeURIComponent('</mark>') + //  Mark the end of the match in a token.
                    '&maxresults=5' +  // The upper limit the for number of suggestions to be included
                    // in the response.  Default is set to 5.
                    '&apikey=' + APIKEY;
                ajaxRequest.open('GET', AUTOCOMPLETION_URL + params );
                ajaxRequest.send();
            }
        }
        query = textBox.value;
    }

    return Object.freeze({
        init,
        autoCompleteListener
    })

}






