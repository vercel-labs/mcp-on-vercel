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
var mcp_api_handler_exports = {};
__export(mcp_api_handler_exports, {
  initializeMcpApiHandler: () => initializeMcpApiHandler
});
module.exports = __toCommonJS(mcp_api_handler_exports);
var import_mcp = require("@modelcontextprotocol/sdk/server/mcp.js");
var import_sse = require("@modelcontextprotocol/sdk/server/sse.js");
var import_node_http = require("node:http");
var import_redis = require("redis");
var import_node_net = require("node:net");
var import_node_stream = require("node:stream");
var import_streamableHttp = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
function createLogger(verboseLogs = false) {
  return {
    log: (...args) => {
      if (verboseLogs)
        console.log(...args);
    },
    error: (...args) => {
      if (verboseLogs)
        console.error(...args);
    },
    warn: (...args) => {
      if (verboseLogs)
        console.warn(...args);
    },
    info: (...args) => {
      if (verboseLogs)
        console.info(...args);
    },
    debug: (...args) => {
      if (verboseLogs)
        console.debug(...args);
    }
  };
}
function initializeMcpApiHandler(initializeServer, serverOptions = {}, config = {
  redisUrl: process.env.REDIS_URL || process.env.KV_URL,
  streamableHttpEndpoint: "/mcp",
  sseEndpoint: "/sse",
  maxDuration: 60,
  verboseLogs: false
}) {
  const {
    redisUrl,
    streamableHttpEndpoint,
    sseEndpoint,
    maxDuration,
    verboseLogs
  } = config;
  const logger = createLogger(verboseLogs);
  const redis = (0, import_redis.createClient)({
    url: redisUrl
  });
  const redisPublisher = (0, import_redis.createClient)({
    url: redisUrl
  });
  redis.on("error", (err) => {
    logger.error("Redis error", err);
  });
  redisPublisher.on("error", (err) => {
    logger.error("Redis error", err);
  });
  const redisPromise = Promise.all([redis.connect(), redisPublisher.connect()]);
  let servers = [];
  let statelessServer;
  const statelessTransport = new import_streamableHttp.StreamableHTTPServerTransport({
    sessionIdGenerator: void 0
  });
  return async function mcpApiHandler(req, res) {
    await redisPromise;
    const url = new URL(req.url || "", "https://example.com");
    if (url.pathname === streamableHttpEndpoint) {
      if (req.method === "GET") {
        logger.log("Received GET MCP request");
        res.writeHead(405).end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32e3,
              message: "Method not allowed."
            },
            id: null
          })
        );
        return;
      }
      if (req.method === "DELETE") {
        logger.log("Received DELETE MCP request");
        res.writeHead(405).end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32e3,
              message: "Method not allowed."
            },
            id: null
          })
        );
        return;
      }
      if (req.method === "POST") {
        logger.log("Got new MCP connection", req.url, req.method);
        if (!statelessServer) {
          statelessServer = new import_mcp.McpServer(
            {
              name: "mcp-typescript server on vercel",
              version: "0.1.0"
            },
            serverOptions
          );
          initializeServer(statelessServer);
          await statelessServer.connect(statelessTransport);
        }
        let bodyContent;
        const contentType = req.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          bodyContent = await req.json();
        } else {
          bodyContent = await req.text();
        }
        const incomingRequest = createFakeIncomingMessage({
          method: req.method,
          url: req.url,
          headers: Object.fromEntries(req.headers),
          body: bodyContent
        });
        await statelessTransport.handleRequest(incomingRequest, res);
      }
    } else if (url.pathname === sseEndpoint) {
      let logInContext2 = function(severity, ...messages) {
        logs.push({
          type: severity,
          messages
        });
      };
      var logInContext = logInContext2;
      logger.log("Got new SSE connection");
      const transport = new import_sse.SSEServerTransport("/message", res);
      const sessionId = transport.sessionId;
      const server = new import_mcp.McpServer(
        {
          name: "mcp-typescript server on vercel",
          version: "0.1.0"
        },
        serverOptions
      );
      initializeServer(server);
      servers.push(server);
      server.server.onclose = () => {
        logger.log("SSE connection closed");
        servers = servers.filter((s) => s !== server);
      };
      let logs = [];
      const handleMessage = async (message) => {
        logger.log("Received message from Redis", message);
        logInContext2("log", "Received message from Redis", message);
        const request = JSON.parse(message);
        const req2 = createFakeIncomingMessage({
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body
          // This could already be an object from earlier parsing
        });
        const syntheticRes = new import_node_http.ServerResponse(req2);
        let status = 100;
        let body = "";
        syntheticRes.writeHead = (statusCode) => {
          status = statusCode;
          return syntheticRes;
        };
        syntheticRes.end = (b) => {
          body = b;
          return syntheticRes;
        };
        await transport.handlePostMessage(req2, syntheticRes);
        await redisPublisher.publish(
          `responses:${sessionId}:${request.requestId}`,
          JSON.stringify({
            status,
            body
          })
        );
        if (status >= 200 && status < 300) {
          logInContext2(
            "log",
            `Request ${sessionId}:${request.requestId} succeeded: ${body}`
          );
        } else {
          logInContext2(
            "error",
            `Message for ${sessionId}:${request.requestId} failed with status ${status}: ${body}`
          );
        }
      };
      const interval = setInterval(() => {
        for (const log of logs) {
          logger[log.type](...log.messages);
        }
        logs = [];
      }, 100);
      await redis.subscribe(`requests:${sessionId}`, handleMessage);
      logger.log(`Subscribed to requests:${sessionId}`);
      let timeout;
      let resolveTimeout;
      const waitPromise = new Promise((resolve) => {
        resolveTimeout = resolve;
        timeout = setTimeout(
          () => {
            resolve("max duration reached");
          },
          (maxDuration ?? 60) * 1e3
        );
      });
      async function cleanup() {
        clearTimeout(timeout);
        clearInterval(interval);
        await redis.unsubscribe(`requests:${sessionId}`, handleMessage);
        logger.log("Done");
        res.statusCode = 200;
        res.end();
      }
      req.signal.addEventListener(
        "abort",
        () => resolveTimeout("client hang up")
      );
      await server.connect(transport);
      const closeReason = await waitPromise;
      logger.log(closeReason);
      await cleanup();
    } else if (url.pathname === "/message") {
      logger.log("Received message");
      const body = await req.text();
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch (e) {
        parsedBody = body;
      }
      const sessionId = url.searchParams.get("sessionId") || "";
      if (!sessionId) {
        res.statusCode = 400;
        res.end("No sessionId provided");
        return;
      }
      const requestId = crypto.randomUUID();
      const serializedRequest = {
        requestId,
        url: req.url || "",
        method: req.method || "",
        body: parsedBody,
        headers: Object.fromEntries(req.headers.entries())
      };
      await redis.subscribe(`responses:${sessionId}:${requestId}`, (message) => {
        clearTimeout(timeout);
        const response = JSON.parse(message);
        res.statusCode = response.status;
        res.end(response.body);
      });
      await redisPublisher.publish(
        `requests:${sessionId}`,
        JSON.stringify(serializedRequest)
      );
      logger.log(`Published requests:${sessionId}`, serializedRequest);
      const timeout = setTimeout(async () => {
        await redis.unsubscribe(`responses:${sessionId}:${requestId}`);
        res.statusCode = 408;
        res.end("Request timed out");
      }, 10 * 1e3);
      res.on("close", async () => {
        clearTimeout(timeout);
        await redis.unsubscribe(`responses:${sessionId}:${requestId}`);
      });
    } else {
      res.statusCode = 404;
      res.end("Not found");
    }
  };
}
function createFakeIncomingMessage(options = {}) {
  const {
    method = "GET",
    url = "/",
    headers = {},
    body = null,
    socket = new import_node_net.Socket()
  } = options;
  const readable = new import_node_stream.Readable();
  readable._read = () => {
  };
  if (body) {
    if (typeof body === "string") {
      readable.push(body);
    } else if (Buffer.isBuffer(body)) {
      readable.push(body);
    } else {
      const bodyString = JSON.stringify(body);
      readable.push(bodyString);
    }
    readable.push(null);
  } else {
    readable.push(null);
  }
  const req = new import_node_http.IncomingMessage(socket);
  req.method = method;
  req.url = url;
  req.headers = headers;
  req.push = readable.push.bind(readable);
  req.read = readable.read.bind(readable);
  req.on = readable.on.bind(readable);
  req.pipe = readable.pipe.bind(readable);
  return req;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  initializeMcpApiHandler
});
