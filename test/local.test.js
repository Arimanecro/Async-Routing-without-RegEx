import { describe, it } from "node:test";
import assert from 'node:assert/strict';
import { addPaths, parser } from "../routing.js";

let routers = {
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

let urls = addPaths(routers);
let parsing = parser(urls);

describe('local-routing', () => {
  it('root', async () => {
    let url = "/";
    let [route] = await parsing(url);
    let router = routers[route]();
    assert.strictEqual(router, 0);
  });
  it('user#1', async () => {
    let url = "user";
    let [route] = await parsing(url);
    let router = routers[route]();
    assert.strictEqual(router, 1);
  });
  it('user#11', async () => {
    let url = "user/";
    let [route] = await parsing(url);
    let router = routers[route]();
    assert.strictEqual(router, 1);
  });
  it('user#111', async () => {
    let url = "/user/";
    let [route] = await parsing(url);
    let router = routers[route]();
    assert.strictEqual(router, 1);
  });
  it('user#2', async () => {
    let url = "john/user";
    let [route, args] = await parsing(url);
    let router = routers[route]();
    let {0: username } = args;
    assert.strictEqual(router, 2);
    assert.strictEqual(username, "john");
  });
  it('user#3', async () => {
    let url = "user/john";
    let [route] = await parsing(url);
    let router = routers[route]();
    assert.strictEqual(router, 3);
  });
  it('user#4', async () => {
    let url = "user/profile";
    let [route] = await parsing(url);
    let router = routers[route]();
    assert.strictEqual(router, 3);
  });
  it('user#5', async () => {
    let url = "user/john/edit";
    let [route, args] = await parsing(url);
    let {0: username } = args;
    let router = routers[route]();
    assert.strictEqual(router, 4);
    assert.strictEqual(username, "john");
  });
  it('user#6', async () => {
    let url = "user/john/delete/post/5";
    let [route, args] = await parsing(url);
    let {0: username, 1: post } = args;
    let router = routers[route]();
    assert.strictEqual(router, 5);
    assert.strictEqual(username, "john");
    assert.strictEqual(post, "5");
  });
  it('about', async () => {
    let url = "about";
    let [route] = await parsing(url);
    let router = routers[route]();
    assert.strictEqual(router, 7);
  });
  it('contacts', async () => {
    let url = "about/contacts";
    let [route] = await parsing(url);
    let router = routers[route]();
    assert.strictEqual(router, 6);
  });
  it('404', async () => {
    let url = "admin";
    let [route] = await parsing(url);
    let router = routers[route]();
    assert.strictEqual(router, 404);
  });
}); 
