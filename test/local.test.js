import { describe, it } from "node:test";
import assert from 'node:assert/strict';
import { addPaths, parser } from "../routing.js";

var routers = {
  "/": () => 0,
  "user": () => 1,
  "/user": () => 1,
  "/user/": () => 1,
  "*/user": () => 2,
  "/user/*": () => 3,
  "/user/profile": () => 3,
  "user/*/edit": () => 4,
  "user/*/delete/post/*": () => 5,
  "about/contacts": () => 6,
  "about": () => 7,
  "404": () => 404
}

var urls = addPaths(routers);
var parsing = parser(urls);

describe('local-routing', () => {
  it('root', async () => {
    var url = "/";
    var [route] = await parsing(url);
    var router = routers[route]();
    assert.strictEqual(router, 0);
  });
  it('user#1', async () => {
    var url = "user";
    var [route] = await parsing(url);
    var router = routers[route]();
    assert.strictEqual(router, 1);
  });
  it('user#11', async () => {
    var url = "user/";
    var [route] = await parsing(url);
    var router = routers[route]();
    assert.strictEqual(router, 1);
  });
  it('user#111', async () => {
    var url = "/user/";
    var [route] = await parsing(url);
    var router = routers[route]();
    assert.strictEqual(router, 1);
  });
  it('user#2', async () => {
    var url = "john/user";
    var [route, args] = await parsing(url);
    var router = routers[route]();
    var {0: username } = args;
    assert.strictEqual(router, 2);
    assert.strictEqual(username, "john");
  });
  it('user#3', async () => {
    var url = "user/john";
    var [route] = await parsing(url);
    var router = routers[route]();
    assert.strictEqual(router, 3);
  });
  it('user#4', async () => {
    var url = "user/profile";
    var [route] = await parsing(url);
    var router = routers[route]();
    assert.strictEqual(router, 3);
  });
  it('user#5', async () => {
    var url = "user/john/edit";
    var [route, args] = await parsing(url);
    var {0: username } = args;
    var router = routers[route]();
    assert.strictEqual(router, 4);
    assert.strictEqual(username, "john");
  });
  it('user#6', async () => {
    var url = "user/john/delete/post/5";
    var [route, args] = await parsing(url);
    var {0: username, 1: post } = args;
    var router = routers[route]();
    assert.strictEqual(router, 5);
    assert.strictEqual(username, "john");
    assert.strictEqual(post, "5");
  });
  it('about', async () => {
    var url = "about";
    var [route] = await parsing(url);
    var router = routers[route]();
    assert.strictEqual(router, 7);
  });
  it('contacts', async () => {
    var url = "about/contacts";
    var [route] = await parsing(url);
    var router = routers[route]();
    assert.strictEqual(router, 6);
  });
  it('404', async () => {
    var url = "admin";
    var [route] = await parsing(url);
    var router = routers[route]();
    assert.strictEqual(router, 404);
  });
}); 