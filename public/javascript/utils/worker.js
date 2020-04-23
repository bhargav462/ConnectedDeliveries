console.log("Service Worker Loaded...");

self.addEventListener("push", e => {
  const data = e.data.json();
  console.log("Push Recieved...",data.mode);
  var message ;
  if(data.mode === 'delivery'){
    message = `${data.name} requests to deliver the items`;
  }else{
    message = `${data.name} wants to deliver the items`;
  }
  self.registration.showNotification(data.title, {
    body: message,
    icon:'https://connected-deliveries.herokuapp.com/images/circle-cropped.png'
  });
});