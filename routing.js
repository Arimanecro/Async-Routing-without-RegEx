import { setImmediate as setImmediatePromise } from 'node:timers/promises';

/**
 * 
 * @param {Map} urls 
 * @param {string} url 
 * @returns {void}
 */
var addUrl = (urls, url) => {
  if (url === "/") return;
  var u = url.split("/");
  u = u.filter((v) => v.trim().replace("/", "") !== "");
  var first = `${u[0]}`;
  var sumWithInitial = u.reduce((accumulator, currentValue) => {
    if (currentValue !== "") {
      currentValue !== "*" ? (accumulator += "1") : (accumulator += "0");
    }
    return accumulator;
  }, "");

  if (!urls.has(`${first}`)) {
    var arr = u.length > 0 ? [u] : [];
    if (u.length === 1) {
      urls.set(`${first}`, {
        paths: [[[first], "1"]],
        routers: [first]
      });
    } else {
      urls.set(`${first}`, {
        paths: [[...arr, sumWithInitial]],
        routers: [url]
      });
    }
  } else {
    var arr = u.length > 0 ? u : [];
    var p = urls.get(`${first}`)?.paths;

    if (p) {
      urls.get(`${first}`).paths.push([arr, sumWithInitial]);
      urls.get(`${first}`).routers.push(url);
    } else {
      urls.get(`${first}`).paths = [];
      urls.get(`${first}`).paths.push([arr, sumWithInitial]);
      urls.get(`${first}`).routers = [];
      urls.get(`${first}`).routers.push(url);
    }
  }
};
/**
 * 
 * @param {Object} routers 
 * @returns {Map}
 */
var addPaths = (routers) => {
  var list = [...Object.keys(routers)];
  var urls = new Map();
  list.forEach((url) => addUrl(urls, url));
  return urls;
};
/**
 * 
 * @param {Map} urls 
 * @param {string} first 
 * @param {[string]} u 
 * @returns {[string,[string]]}
 */
var checker = (urls, first, u) => {
  var result = "404";
  var paths = urls.get(first).paths;
  var match = "";
  var args = [];

  for (let k = 0; k < paths.length; k++) {
    var { 0: path, 1: numbers } = paths[k];
    if (u.length === path.length) {
      for (let k1 = 0; k1 < u.length; k1++) {
        match += u[k1] === path[k1] ? "1" : (args.push(u[k1]), "0"); 
      }
    }
    if (match === numbers) {
      result = urls.get(first).routers[k];
      match = "";
      break;
    }
    match = "";
  }

  return [result, args];
};
/**
 * 
 * @param {Map} urls 
 * @param {string} url
 * @returns {Promise<[string,[string]]>}
 */
var parser = (urls) => (url) => {
  return new Promise((resolve, reject) => {
    
    if (url === "/") return resolve(["/"]);

    var u = url.split("/");
    u = u.filter((v) => v.trim().replace("/", "") !== "");
    var first = `${u[0]}`;

    if (!urls.has(first) && !urls.has("*")) resolve(["404"]); 
    
    if (urls.has(first)) {
      return setImmediatePromise(checker(urls, first, u)).then(resolve);
      //return Promise.resolve(checker(urls, first, u));
    } else {
      return setImmediatePromise(checker(urls, "*", u)).then(resolve);
      //return Promise.resolve(checker(urls, "*", u));
    }
  });
};

export { addPaths, parser };