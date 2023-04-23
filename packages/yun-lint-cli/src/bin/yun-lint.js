#!/usr/bin/env node

import { program } from "commander";

import { pkg } from "../utils/constants.js";

import init from "../actions/init.js";

import scan from "../actions/scan.js";

import print from "../utils/print.js";

import { update } from "../actions/update.js";

import ora from "ora";

program
  .version(pkg.version, "-v, --version")
  .description(
    `${pkg.name} 的目标是为了规范项目代码，降低接入 lint 工具的门槛，实现了【一键接入】【一键扫描】【一键修复】`
  );

program
  .command("init")
  .description("【一键接入】初始化依赖和配置，一键接入 eslint 、 prettier 和 commitlint")
  .action(() => {
    init();
  });

program
  .command("scan")
  .description("【一键扫描】扫描工程中潜在的问题")
  .option("-i, --include <dirpath>", "指定目录")
  .action(async (cmd) => {
    const loading = ora();
    loading.start(`执行 ${pkg.name} 项目扫描`);
    const { results, errorCount, warningCount, runErrors } = await scan({
      include: cmd.include,
    });
    if (runErrors.length > 0 || errorCount > 0) {
      loading.fail();
    } else if (warningCount > 0) {
      loading.warn();
    } else {
      loading.succeed();
    }
    if (results.length > 0) print(results, false);

    runErrors.forEach((e) => console.log(e));
  });

program
  .command("fix")
  .description("【一键修复】自动修复工程中存在的问题")
  .option("-i, --include <dirpath>", "指定目录")
  .action(async (cmd) => {
    scan({
      include: cmd.include,
      fix: true,
    });

    const loading = ora();
    loading.start(`执行 ${pkg.name} 代码修复`);

    const { results } = await scan({
      include: cmd.include,
      fix: true,
    });

    loading.succeed();
    if (results.length > 0) print(results, true);
  });


program
  .command("update")
  .description(`【一键升级】更新 ${pkg.version} 至最新版本`)
  .action(() => update());

program.parse(process.argv);
