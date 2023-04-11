import { createRequire } from "module";

import { fileURLToPath } from "url";

import path from "path";

const require = createRequire(import.meta.url);

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

// package.json信息
export const pkg = require(path.resolve(__dirname, "../../", "package.json"));
