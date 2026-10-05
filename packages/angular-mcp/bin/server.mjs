#!/usr/bin/env node
// stdio entry point: `npx -y @surface-one/angular-mcp@latest`
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

import { createSurfaceOneServer } from "../src/server.mjs";

const server = createSurfaceOneServer();
await server.connect(new StdioServerTransport());
