navigator.serviceWorker
  .register(`mockApiServiceWorker.js`, { scope: "./" })
  .catch((err) => console.error("error registering sw", err));

window.addEventListener("beforeunload", () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "CLIENT_CLOSED" });
  }
});

navigator.serviceWorker.onmessage = ({ data, ports }) => {
  if (data && data.type === "REQUEST") {
    const { url } = data.request;
    const requestUrl = new URL(url);
    const port = ports[0];

    if (requestUrl.pathname === "/hello") {
      port.postMessage({
        response: { hello: "word10" },
        type: "MOCK_SUCCESS",
      });
      return;
    }

    port.postMessage({
      type: "MOCK_NOT_FOUND",
    });
  }
};
