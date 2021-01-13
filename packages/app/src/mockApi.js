navigator.serviceWorker
  .register(`service-worker.js`, { scope: "./" })
  .then(function (reg) {
    console.info("registered sw", reg);
  })
  .catch(function (err) {
    console.error("error registering sw", err);
  });

navigator.serviceWorker.onmessage = (event) => {
  if (event.data && event.data.type === "REQUEST") {
    const requestUrl = new URL(event.data.request.url);
    console.log(event.data.request);

    if (requestUrl.pathname === "/hello") {
      event.source.postMessage({ hello: "word10" });
    }
  }
};
