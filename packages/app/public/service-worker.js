self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  console.log(event.data);
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.destination) {
    return;
  }

  self.clients
    .matchAll({
      includeUncontrolled: true,
      type: "window",
    })
    .then((clients) => {
      if (clients && clients.length) {
        // Send a response - the clients
        // array is ordered by last focused
        // https://developers.google.com/web/fundamentals/push-notifications/common-notification-patterns
        // https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
        // https://github.com/jbmoelker/serviceworker-introduction

        clients[0].postMessage({
          type: "REQUEST",
          request: {
            url: event.request.url,
            credentials: event.request.credentials,
            destination: event.request.destination,
            mode: event.request.mode,
          },
        });
      }
    });

  if (requestUrl.pathname === "/hello") {
    console.log(event.request.url);
    event.respondWith(new Response(JSON.stringify({ hello: "word10" })));
  }
});
