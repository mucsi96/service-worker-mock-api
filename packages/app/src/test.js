import "jasmine-core/lib/jasmine-core/jasmine.css";
import "jasmine-core/lib/jasmine-core/jasmine-html.js";
import "jasmine-core/lib/jasmine-core/boot.js";

window.jasmine.getEnv().configure({
  random: false,
});

const { registerMocks } = require("mock-api");

describe("mock-api", () => {
  const getSpy = jasmine.createSpy();
  const postSpy = jasmine.createSpy();
  const mocks = [
    {
      path: "/todos/:id/:subid",
      callback: getSpy,
    },
    {
      path: "/todos",
      method: "POST",
      callback: postSpy,
    },
  ];

  registerMocks(mocks);

  afterEach(() => {
    getSpy.and.stub();
    postSpy.and.stub();
    getSpy.calls.reset();
    postSpy.calls.reset();
  });

  it("passes request url to callback", async () => {
    await fetch("/todos/3/78");
    const request = getSpy.calls.first().args[0];
    expect(request.url).toEqual("/todos/3/78");
  });

  it("passes request method to callback", async () => {
    await fetch("/todos", { method: "POST" });
    const request = postSpy.calls.first().args[0];
    expect(request.method).toEqual("POST");
  });

  it("passes request headers to callback", async () => {
    await fetch("/todos/3/78");
    const request = getSpy.calls.first().args[0];
    expect(request.headers.accept).toEqual("*/*");
  });

  it("passes path parameters to callback", async () => {
    await fetch("/todos/3/78");
    const request = getSpy.calls.first().args[0];
    expect(request.params.id).toEqual("3");
    expect(request.params.subid).toEqual("78");
  });

  it("passes query parameters to callback", async () => {
    await fetch("/todos/3/78?max=10&all=true&include=1&include=2");
    const request = getSpy.calls.first().args[0];
    expect(request.query.max).toEqual("10");
    expect(request.query.all).toEqual("true");
    expect(request.query.include).toEqual(["1", "2"]);
  });

  it("passes body to callback", async () => {
    await fetch("/todos", {
      method: "POST",
      body: JSON.stringify({ test: "body" }),
    });
    const request = postSpy.calls.first().args[0];
    expect(request.body.test).toEqual("body");
  });

  it("mocks body", async () => {
    getSpy.and.returnValue({ test: "body" });
    const response = await fetch("/todos/3/78");
    const data = await response.json();
    expect(data.test).toEqual("body");
  });

  it("mocks status", async () => {
    getSpy.and.callFake((req, res) => res.status(500));
    const response = await fetch("/todos/3/78");
    expect(response.status).toEqual(500);
  });

  it("mocks delay", async () => {
    const originalTimeout = window.setTimeout;
    window.setTimeout = jasmine
      .createSpy("setTimeout")
      .and.callFake((callback) => callback());

    getSpy.and.callFake((req, res) => {
      res.delay(1003);
      return { test: "body" };
    });
    const response = await fetch("/todos/3/78");
    const data = await response.json();
    expect(data.test).toEqual("body");

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout.calls.first().args[1]).toEqual(1003);
    window.setTimeout = originalTimeout;
  });

  it("mocks error", async () => {
    getSpy.and.callFake((req, res) => res.mockError(true));
    const response = await fetch("/todos/3/78");
    const data = await response.json();
    expect(response.status).toEqual(500);
    expect(data.error.message).toEqual(
      "We couldn't process your request at this time"
    );
  });

  it("mocks html", async () => {
    getSpy.and.callFake((req, res) => res.mockHTML(true));
    const response = await fetch("/todos/3/78");
    const html = await response.text();
    expect(response.status).toEqual(200);
    expect(html).toEqual("<html></html>");
  });
});
