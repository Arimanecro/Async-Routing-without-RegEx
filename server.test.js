// node --test

import http from "node:http";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addPaths, parser } from "./routing.js";

var routers = {
  "/": () => ({route: "index"}),
  "user": () => ({route: "user"}),
  "/user/*": () => ({route: "user/john/", args: ["john"] }),
  "user/*/edit": () => ({route: "user/john/edit", args: ["john"]}),
  "user/*/edit/*": () => ({route: "user/john/edit/5", args: ["john", "5"]}),
  "about/contacts": () => ({route:"contacts"}),
  "about": () => ({route: "about"}),
  "404": () => ({route:"404"})
};

var urls = addPaths(routers);
var parsing = parser(urls);

http
  .createServer(async (req, res) => {
    let route = await parsing(req.url);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(route));
  })
  .listen(3000, () => console.log("Server is started"));
  

const paths = {
  "/": "/",
  "user": "user",
  "user/john": "/user/*",
  "user/john/edit": "user/*/edit",
  "user/john/edit/5": "user/*/edit/*",
  "about/contacts": "about/contacts",
  "about": "about",
  "nothing": "404",
};

describe("server-routing", () => {
  for (const [key, value] of Object.entries(paths)) {
    
    let path = key === "/" ? "" : key;

    it(`${key}`, async () => {
      var res = await fetch(`http://localhost:3000/${path}`);
      var [route, args] = await res.json();
      assert.strictEqual(value, route);
      args?.length && assert.strictEqual(routers[route]()["args"].toString(), args.toString());
    });
  }
});

setTimeout(() => process.exit(0), 1000);