import { pathToRegexp } from "path-to-regexp";

export type MockRequest = {
  url: string;
};

export type MockResponse = {};

export type Mock = {
  path: string;
  callback: (
    req: MockRequest,
    res: MockResponse
  ) => Promise<object | undefined> | object | undefined;
};

export function registerMocks(mocks: Mock[]): void {
  const mocksWithRegexp = mocks.map((mock) => ({
    regexp: pathToRegexp(mock.path),
    ...mock,
  }));

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
      const mock = mocksWithRegexp.find(({ regexp }) => regexp.test(url));

      if (!mock) {
        return port.postMessage({
          type: "MOCK_NOT_FOUND",
        });
      }

      port.postMessage({
        response: await mock.callback({ url }, {}),
        type: "MOCK_SUCCESS",
      });
    }
  };
}
