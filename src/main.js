const publicVapidKey = import.meta.env.VITE_PUBLIC_VAPID_KEY;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

if ("serviceWorker" in navigator) {
  registerWorker().catch((err) => console.error(err));
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

async function registerWorker() {
  try {
    await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    if(!navigator.serviceWorker.controller) {
      console.log('Service Worker aún no controla la página.');
      await new Promise(resolve => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker ahora controla la página.');
          resolve();
        });
      });
      await requestNotificationPermission()
    } else {
      await requestNotificationPermission()
    }

    await registerSubscription()

  } catch (error) {
    console.error("Error al registrar el service worker:", error);
  }

}

async function requestNotificationPermission() {
  const LOCAL_STORAGE_ID = 'notifications_requested';

  const isGranted = localStorage.getItem(LOCAL_STORAGE_ID);
  if (isGranted === 'true') {
    return;
  }

  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return;
  }

  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    console.log('Notificaciones permitidas.');
  } else {
    console.log('Permiso de notificaciones rechazado.');
  }
  localStorage.setItem(LOCAL_STORAGE_ID, 'true');
}

const registerSubscription = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
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
  } catch (error) {
    console.error("Error al suscribir al usuario:", error);
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
