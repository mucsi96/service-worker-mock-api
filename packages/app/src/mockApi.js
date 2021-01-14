export function registerMocks(mocks) {
  navigator.serviceWorker
    .register(`mockApiServiceWorker.js`, { scope: "./" })
    .catch((err) => console.error("error registering sw", err));

  window.addEventListener("beforeunload", () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "CLIENT_CLOSED" });
    }
  });

  navigator.serviceWorker.onmessage = async ({ data, ports }) => {
    if (data && data.type === "REQUEST") {
      const { url } = data.request;
      const port = ports[0];
      const mock = mocks.find(({ path }) => path === url);

      if (!mock) {
        return port.postMessage({
          type: "MOCK_NOT_FOUND",
        });
      }

      port.postMessage({
        response: await mock.callback({ url: requestUrl }, {}),
        type: "MOCK_SUCCESS",
      });
    }
  };
}
