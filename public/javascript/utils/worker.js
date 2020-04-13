console.log("Service Worker Loaded...");

self.addEventListener("push", e => {
  const data = e.data.json();
  console.log("Push Recieved...");
  self.registration.showNotification(data.title, {
    body: "Accepted by bhargav",
    icon:'https://connected-deliveries.herokuapp.com/images/circle-cropped.png'
  });
});