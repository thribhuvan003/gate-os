self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || "GATE OS", { body: data.body || "Your next meaningful action is ready.", icon: "/icon.svg", badge: "/icon.svg", data: { url: data.url || "/app" } }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/app"));
});
