/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { ServerResponse } from 'node:http';
export type BodyType = string | Buffer | Record<string, any> | null;
/**
 * Anthropic's MCP API requires a server response object. This function
 * creates a fake server response object that can be used to pass to the MCP API.
 */
export declare function createServerResponseAdapter(signal: AbortSignal, fn: (re: ServerResponse) => Promise<void> | void): Promise<Response>;
