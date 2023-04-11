import path from "path";
import fs from "fs-extra";
import _ from "lodash";
import glob from "glob";
import ejs from "ejs";
import { __dirname } from "./constants.js";

export default (cwd, data) => {
  const templatePath = path.resolve(__dirname, "../config");
  const templates = glob.sync("**/*.ejs", {
    cwd: templatePath,
  });
  for (const name of templates) {
    const filepath = path.resolve(
      cwd,
      name.replace(/\.ejs$/, "").replace(/^_/, ".")
    );
    let content = ejs.render(
      fs.readFileSync(path.resolve(templatePath, name), "utf8"),
      data
    );

    // 跳过空文件
    if (!content.trim()) continue;

    fs.outputFileSync(filepath, content, "utf8");
  }
};
