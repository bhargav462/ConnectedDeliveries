console.log("Service Worker Loaded...");

self.addEventListener("push", e => {
  const data = e.data.json();
  console.log("Push Recieved...",data.mode);
  var message ;
  if(data.mode === 'delivery'){
    message = `${data.name} requests to deliver his items`;
  }else if(data.mode === 'receive'){
    message = `${data.name} wants to deliver your items`;
  }else if(data.mode === 'deliveryAccepted'){
    message = `${data.name} accepted your delivery Request`;
  }else if(data.mode === 'receiveAccepted'){
    message = `${data.name} accpted your request to deliver your items`;
  }else{
    message = " ";
  }
  self.registration.showNotification(data.title, {
    body: message,
    icon:'https://connected-deliveries.herokuapp.com/images/circle-cropped.png'
  });
});