const publicVapidKey = import.meta.env.VITE_PUBLIC_VAPID_KEY;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

let suscription;

if ("serviceWorker" in navigator) {
  send().catch((err) => console.error(err));
  const registration = await navigator.serviceWorker.ready;
  suscription = await registration.pushManager.getSubscription();
}

document.getElementById("notifyButton").addEventListener("click", () => {
  fetch(`${backendUrl}/trigger-notification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Notificación forzada desde el cliente!" }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      console.log("Solicitud enviada correctamente.");
    })
    .catch((error) => {
      console.error("Error al enviar la solicitud:", error);
    });
});

document.getElementById("unsubscribeButton").addEventListener("click", async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        await fetch(`${backendUrl}/unsubscribe`, {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Usuario desuscrito correctamente.');
      }
    } catch (error) {
      console.error('Error al desuscribir al usuario:', error);
    }
  }
});

async function send() {
  const register = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });

  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  });

  await fetch(`${backendUrl}/subscribe`, {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
