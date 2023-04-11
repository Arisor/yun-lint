import chalk from "chalk";

import { pkg } from "../utils/constants.js";

const { green, blue, yellow, red } = chalk;

const UNICODE = {
  success: "\u2714", // ✔
  failure: "\u2716", // ✖
};

export default {
  success(text) {
    console.log(green(text));
  },
  info(text) {
    console.info(blue(text));
  },
  warn(text) {
    console.info(yellow(text));
  },
  error(text) {
    console.error(red(text));
  },
  result(text, pass) {
    console.info(
      blue(`[${pkg.name}] ${text}`),
      pass ? green(UNICODE.success) : red(UNICODE.failure)
    );
  },
};
