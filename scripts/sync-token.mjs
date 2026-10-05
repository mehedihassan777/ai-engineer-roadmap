#!/usr/bin/env node
import { randomBytes } from "node:crypto";

// A fresh random sync token (43 URL-safe characters, 256 bits). Nothing is stored; copy it where you need it.
const token = randomBytes(32).toString("base64url");
console.log(token);
console.error("\nPut this in .env.local (and your host's environment settings) as:  SYNC_TOKEN=<the value above>");
console.error("Then paste the same value into Settings > Cloud sync on each device.");
