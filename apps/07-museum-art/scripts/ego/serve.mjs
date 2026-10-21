#!/usr/bin/env node
/** 临时：独立起服务器，用于排查 Ego 连通性 */
import { startServer } from "../lib/server.mjs";

const { server, port } = await startServer(process.argv[2] || "dist", Number(process.argv[3] || 8941), process.argv[4] || "");
console.log(`serving ${process.argv[2] || "dist"} on http://127.0.0.1:${port}${process.argv[4] || ""}`);
process.on("SIGTERM", () => server.close(() => process.exit(0)));
