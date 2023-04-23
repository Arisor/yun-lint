import glob from "glob";

import fs from "fs-extra";

import prettier from "prettier";

import path from "path";

import { ESLint } from "eslint";

export default async (options) => {
  const { fix = false, include } = options;
  const suffix = [".js", ".jsx", ".ts", ".tsx", ".vue"];
  const cwd = process.cwd();

  await fixByPrettier({ cwd, fix, suffix });
  return await scanAndFixByEslint({ cwd, fix, suffix, include });
};

// 使用prettier进行修复
const fixByPrettier = async (options) => {
  const { cwd, fix, suffix } = options;
  if (fix) {
    // 获取命令执行的目录
    const files = glob.sync(
      `**/*.{${suffix.map((t) => t.replace(/^\./, "")).join(",")}}`,
      {
        cwd,
        ignore: [
          "node_modules/**/*",
          "build/**/*",
          "dist/**/*",
          "lib/**/*",
          "es/**/*",
          "coverage/**/*",
        ],
      }
    );

    for (const filepath of files) {
      const code = fs.readFileSync(filepath, "utf8");
      const options = await prettier.resolveConfig(filepath);
      const formatCode = prettier.format(code, { ...options, filepath });
      fs.writeFileSync(filepath, formatCode, "utf8");
    }
  }
};

// 使用eslint进行扫描和修复
const scanAndFixByEslint = async (options) => {
  const { cwd, fix, suffix, include } = options;
  let results = [];
  const runErrors = [];

  try {
    const files = path.resolve(
      cwd,
      include || cwd,
      `**/*.{${suffix.map((t) => t.replace(/^\./, "")).join(",")}}`
    );
    const eslint = new ESLint({
      cwd,
      fix,
      extensions: suffix,
      errorOnUnmatchedPattern: false,
    });
    const reports = await eslint.lintFiles(files);
    fix && (await ESLint.outputFixes(reports));
    results = results.concat(
      reports
        .filter(({ warningCount, errorCount }) => errorCount || warningCount)
        .map(
          ({
            filePath,
            errorCount,
            warningCount,
            fixableErrorCount,
            fixableWarningCount,
            messages,
          }) => {
            return {
              filePath,
              errorCount,
              warningCount,
              fixableErrorCount,
              fixableWarningCount,
              messages: messages.map(
                ({
                  line = 0,
                  column = 0,
                  ruleId,
                  message,
                  fatal,
                  severity,
                }) => {
                  return {
                    line,
                    column,
                    rule: ruleId,
                    url: getRuleDocUrl(ruleId),
                    message: message.replace(/([^ ])\.$/u, "$1"),
                    errored: fatal || severity === 2,
                  };
                }
              ),
            };
          }
        )
    );
  } catch (e) {
    runErrors.push(e);
  }
  return {
    results,
    errorCount: results.reduce(
      (count, { errorCount }) => count + errorCount,
      0
    ),
    warningCount: results.reduce(
      (count, { warningCount }) => count + warningCount,
      0
    ),
    runErrors,
  };
};

// 获取规则文档地址
const getRuleDocUrl = (rule) => {
  if (!rule) return "";

  // eslint-plugin-vue
  const match = rule.match(/^vue\/(\S+)$/);
  if (match) {
    return `https://eslint.vuejs.org/rules/${match[1]}.html`;
  }

  return `https://eslint.org/docs/rules/${rule}`;
};
