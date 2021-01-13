import "./mockApi";

const button = document.createElement("button");

button.innerText = "fetch";
button.id = "fetch";

document.body.appendChild(button);

document.getElementById("fetch").addEventListener("click", () => {
  fetchData();
});

async function fetchData() {
  const res = await fetch("/hello");
  const data = await res.json();
  console.log(data);
}
