"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var server_response_adapter_exports = {};
__export(server_response_adapter_exports, {
  createServerResponseAdapter: () => createServerResponseAdapter
});
module.exports = __toCommonJS(server_response_adapter_exports);
var import_node_events = require("node:events");
function createServerResponseAdapter(signal, fn) {
  let writeHeadResolver;
  const writeHeadPromise = new Promise((resolve) => {
    writeHeadResolver = resolve;
  });
  return new Promise((resolve) => {
    let controller;
    let shouldClose = false;
    let wroteHead = false;
    const writeHead = (statusCode, headers) => {
      if (typeof headers === "string") {
        throw new Error("Status message of writeHead not supported");
      }
      wroteHead = true;
      writeHeadResolver({
        statusCode,
        headers
      });
      return fakeServerResponse;
    };
    const bufferedData = [];
    const write = (chunk, encoding) => {
      if (encoding) {
        throw new Error("Encoding not supported");
      }
      if (chunk instanceof Buffer) {
        throw new Error("Buffer not supported");
      }
      if (!wroteHead) {
        writeHead(200);
      }
      if (!controller) {
        bufferedData.push(new TextEncoder().encode(chunk));
        return true;
      }
      controller.enqueue(new TextEncoder().encode(chunk));
      return true;
    };
    const eventEmitter = new import_node_events.EventEmitter();
    const fakeServerResponse = {
      writeHead,
      write,
      end: (data) => {
        if (data) {
          write(data);
        }
        if (!controller) {
          shouldClose = true;
          return fakeServerResponse;
        }
        try {
          controller.close();
        } catch {
        }
        return fakeServerResponse;
      },
      on: (event, listener) => {
        eventEmitter.on(event, listener);
        return fakeServerResponse;
      }
    };
    signal.addEventListener("abort", () => {
      eventEmitter.emit("close");
    });
    void fn(fakeServerResponse);
    void (async () => {
      const head = await writeHeadPromise;
      const response = new Response(
        new ReadableStream({
          start(c) {
            controller = c;
            for (const chunk of bufferedData) {
              controller.enqueue(chunk);
            }
            if (shouldClose) {
              controller.close();
            }
          }
        }),
        {
          status: head.statusCode,
          headers: head.headers
        }
      );
      resolve(response);
    })();
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createServerResponseAdapter
});
