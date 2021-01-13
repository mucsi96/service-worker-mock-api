self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  console.log(event.data);
});

self.addEventListener("fetch", (event) => {
  event.respondWith(onRequest(event.request));
});

async function onRequest(request) {
  if (request.destination) {
    return await fetch(request);
  }

  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });

  if (clients && clients.length) {
    // Send a response - the clients
    // array is ordered by last focused
    // https://developers.google.com/web/fundamentals/push-notifications/common-notification-patterns
    // https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
    // https://github.com/jbmoelker/serviceworker-introduction

    clients[0].postMessage({
      type: "REQUEST",
      request: {
        url: request.url,
        credentials: request.credentials,
        destination: request.destination,
        mode: request.mode,
      },
    });
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.pathname === "/hello") {
    console.log(request.url);
    return new Response(JSON.stringify({ hello: "word10" }));
  }

  return await fetch(request);
}
