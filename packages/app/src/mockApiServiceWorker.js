self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request, clientId } = event;
  const { destination, cache, mode } = request;

  if (
    !clientId ||
    destination ||
    (cache === "only-if-cached" && mode !== "same-origin")
  ) {
    return;
  }

  event.respondWith(createResponse(clientId, request));
});

self.addEventListener("message", async ({ data }) => {
  if (data && data.type === "CLIENT_CLOSED") {
    const clients = await getClients();

    if (!clients || !clients.length || clients.length === 1) {
      self.registration.unregister();
    }
  }
});

async function getClients() {
  return await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
}

function sendToClient(client, message) {
  return new Promise((resolve) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (event) => resolve(event.data);

    client.postMessage(message, [channel.port2]);
  });
}

async function createResponse(clientId, request) {
  const getOriginalResponse = () => fetch(request);
  const client = await self.clients.get(clientId);

  if (!client) {
    return getOriginalResponse();
  }

  const { url, method } = request;
  const urlPath = new URL(url).pathname;

  const { type, response } = await sendToClient(client, {
    type: "REQUEST",
    request: {
      url: urlPath,
      method: method,
    },
  });

  if (type !== "MOCK_SUCCESS") {
    return getOriginalResponse();
  }

  return new Response(JSON.stringify(response));
}
