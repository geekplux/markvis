#!/usr/bin/env node
import { register } from "tsx/esm/api";

register();
const { runCli } = await import("./src/cli.ts");
process.exit(runCli(process.argv.slice(2)));
