const path = require("path");
const fs = require("fs");
const vm = require("vm");

function Require(modulePath) {
  const absolutePath = path.resolve(__dirname, modulePath);
  if (Module._cache[absolutePath]) {
    return Module._cache[absolutePath].exports;
  }
  const module = new Module(absolutePath);
  module._load();
  return module.exports;
}

class Module {
  constructor(id) {
    this.id = id;
    this.exports = {};
  }

  static _cache = {};

  static wrapper = [
    "(function(exports, Require, module, __dirname, __filename) {",
    "})",
  ];

  static _extensions = {
    ".js"(module) {
      const content = fs.readFileSync(module.id, "utf8");
      const fnStr = Module.wrapper[0] + content + Module.wrapper[1];
      const fn = vm.runInThisContext(fnStr);
      fn.call(
        module.exports,
        module.exports,
        Require,
        module,
        __filename,
        __dirname
      );
    },
    ".json"(module) {
      const json = fs.readFileSync(module.id, "utf8");
      module.exports = JSON.parse(json);
    },
  };

  _load() {
    const ext = path.extname(this.id);
    try {
      Module._extensions[ext](this);
      Module._cache[this.id] = this;
    } catch (error) {
      throw error;
    }
  }
}

const test = Require("./test.js");
console.log(test(1, 2));
