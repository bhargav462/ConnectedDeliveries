console.log("Service Worker Loaded...");

self.addEventListener("push", e => {
  const data = e.data.json();
  console.log("Push Recieved...");
  self.registration.showNotification(data.title, {
    body: `Your request was accepted by ${data.name}`,
    icon:'https://connected-deliveries.herokuapp.com/images/circle-cropped.png'
  });
});