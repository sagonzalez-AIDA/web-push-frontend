self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(clients.claim());
})

self.addEventListener("push", (event) => {
  event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: false }).then((clientList) => {
        const isAppFocused = clientList.some((client) => client.focused);
        if(!isAppFocused){
          const data = event.data.json();
          self.registration.showNotification(data.title, {
            body: "Notificación recibida!",
            icon: "https://via.placeholder.com/128",
          });
        }
      })
  )
});
