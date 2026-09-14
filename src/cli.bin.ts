#!/usr/bin/env node
import { runCli } from "./cli.js";

process.exit(runCli(process.argv.slice(2)));
