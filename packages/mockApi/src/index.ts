import { Key, pathToRegexp } from "path-to-regexp";

export type MockMethod = "GET" | "POST" | "DELETE" | "PUT";

export type MockRequest = {
  url: string;
  method: MockMethod;
  headers: Record<string, string | string[]>;
  body: object;
};

export type MockResponse = {};

export type Mock = {
  path: string;
  method: MockMethod;
  callback: (
    req: MockRequest,
    res: MockResponse
  ) => Promise<object | undefined> | object | undefined;
};

export type MockWithRegexp = Mock & {
  regexp: RegExp;
  keys: string[];
};

export function registerMocks(mocks: Mock[]): void {
  const mocksWithRegexp = mocks.map((mock) => {
    const keys: Key[] = [];
    const regexp = pathToRegexp(mock.path, keys);

    return {
      regexp,
      keys: keys.map((key) => key.name),
      ...mock,
    };
  }) as MockWithRegexp[];

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
      const { url: fullUrl, method, body } = data.request as {
        url: string;
        method: string;
        body: string;
      };
      const url = new URL(fullUrl);
      const port = ports[0];
      const mock = mocksWithRegexp.find(
        (mock) =>
          mock.regexp.test(url.pathname) && (mock.method || "GET") === method
      );

      const match = mock && mock.regexp.exec(url.pathname);

      if (!match || !mock) {
        return port.postMessage({
          type: "MOCK_NOT_FOUND",
        });
      }

      const responseBody = await mock.callback(
        {
          ...data.request,
          url: url.pathname,
          params: getParams(match, mock),
          query: getQuery(url.searchParams),
          body: body && JSON.parse(body),
        },
        {}
      );

      port.postMessage({
        response: {
          status: 200,
          body: JSON.stringify(responseBody),
        },
        type: "MOCK_SUCCESS",
      });
    }
  };
}

function getParams(match: RegExpExecArray, mock: MockWithRegexp) {
  return match.reduce((acc, val, i) => {
    const prop = mock.keys[i - 1];

    if (!prop) {
      return acc;
    }

    if (val !== undefined || !(prop in acc)) {
      acc[prop] = val;
    }

    return acc;
  }, {} as Record<string, string>);
}

function getQuery(searchParams: URLSearchParams) {
  const query = {} as Record<string, string | string[]>;

  searchParams.forEach((value, name) => {
    if (Array.isArray(query[name])) {
      query[name] = [...query[name], value];
      return;
    }

    if (query[name]) {
      query[name] = [query[name] as string, value];
      return;
    }

    query[name] = value;
  });
  return query;
}
