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
var next_exports = {};
__export(next_exports, {
  default: () => createMcpRouteHandler
});
module.exports = __toCommonJS(next_exports);
var import_mcp_api_handler = require("./mcp-api-handler");
var import_server_response_adapter = require("./server-response-adapter");
function createMcpRouteHandler(initializeServer, serverOptions, config) {
  const mcpHandler = (0, import_mcp_api_handler.initializeMcpApiHandler)(
    initializeServer,
    serverOptions,
    config
  );
  return (request) => {
    return (0, import_server_response_adapter.createServerResponseAdapter)(request.signal, (res) => {
      mcpHandler(request, res);
    });
  };
}
