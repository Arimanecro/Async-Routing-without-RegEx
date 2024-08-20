import http from "node:http";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addPaths, parser } from "../routing.js";

var routers = {
  "/": () => "index",
  "user": () => "user",
  "/user/*": () => "user/john/",
  "user/*/edit": () => "user/john/edit",
  "about/contacts": () => "contacts",
  "about": () => "about",
  "404": () => "404",
};

var urls = addPaths(routers);
var parsing = parser(urls);

http
  .createServer(async (req, res) => {
    let [route] = await parsing(req.url);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(route);
  })
  .listen(3000, () => console.log("SERVER"));
  

const paths = {
  "/": "/",
  "user": "user",
  "user/john": "/user/*",
  "user/john/edit": "user/*/edit",
  "about/contacts": "about/contacts",
  "about": "about",
  "nothing": "404",
};

describe("server-routing", () => {
  for (const [key, value] of Object.entries(paths)) {
    let path = key === "/" ? "" : key;

    it(`${key}`, async () => {
      var res = await fetch(`http://localhost:3000/${path}`);
      var text = await res.text();
      assert.strictEqual(value, text);
    });

  }
});

setTimeout(() => process.exit(0), 1000);