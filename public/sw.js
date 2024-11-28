self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: "Notificación recibida!",
    icon: "https://via.placeholder.com/128",
  });
});
