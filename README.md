## What's wrong with regular expressions in routing?!

❗They are vulnerable to ReDoS attacks

For example, this check will take ~20 seconds:
```
/^(a+)+$/.test(`${'a'.repeat(31)}!`)
```

If you add at least one letter, the check will take ~40 seconds.

```
/^(a+)+$/.test(`${'a'.repeat(32)}!`)
```

> ✅ _The Async-Routing-without-RegEx partially executes logic in microtasks and partially in macrotask queue (setImmediate). This allows to give a quantum of time to other stages of the event loop._

## How routing works without regular expressions.

Algorithm:
- addPaths function takes as an argument an object with a routing template.
- addPaths function creates a structure as a Map object.
- addPaths function checks the string and marks each word as 1, and an asterisk as 0
- parser function takes as an argument the URL.
- parser function checks the string and marks each match as 1, and a mismatch as 0. And checks ones and zeros in the Map structure. If they match, it returns the routing template, if not, it returns string 404.

E.g.

```
import { addPaths, parser } from "./routing.js";

const routers = {
  "/user/*": () => 1,
  "user/*/edit/*": () => 2,
  "/about": () => 3,
  "404": () => 404
}

var urls = addPaths(routers);
var parsing = parser(urls);

{
    let url = "user/john";
    var [route, args] = await parsing(url);
    var {0: username } = args;
    console.log(route) // "/user/*"
    console.log(username) // john
}

{
    let url = "user/john/edit/5";
    var [route, args] = await parsing(url);
    var {0: username, 1: post } = args;
    console.log(route) // "user/*/edit/*"
    console.log(username, post) // john, 5
}

{
    let url = "about";
    var [route] = await parsing(url);
    console.log(route) // "/about"
}

{
    let url = "something";
    var [route] = await parsing(url);
    console.log(route) // "404"
}
```
