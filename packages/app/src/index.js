const tests = [
  {
    mock: {
      path: "/todos/:id/:subid",
      callback(request, response) {
        return { request, response };
      },
    },
    trigger: {
      title: "GET",
      url: "/todos/3/78?max=10&all=true",
      method: "GET",
      async callback(response) {
        const data = await response.json();
        responseBlock(data);
      },
    },
  },
];

registerMocks(tests.map((test) => test.mock));

function trigegrButton({ title, url, method, callback }) {
  const element = document.createElement("button");
  element.innerText = title;
  element.addEventListener("click", async () => {
    callback(await fetch(url, { method }));
  });
  document.body.appendChild(element);
}

function responseBlock(data) {
  const element = document.createElement("pre");
  element.innerText = JSON.stringify(data, null, 2)
    .replace(/[{}",]/g, "")
    .split("\n")
    .filter((line) => !/^\s*$/.test(line))
    .filter(Boolean)
    .join("\n");
  element.style.border = "1px solid gray";
  element.style.borderRadius = "10px";
  element.style.padding = "10px";
  document.body.appendChild(element);
}

tests.forEach(({ trigger }) => trigegrButton(trigger));
