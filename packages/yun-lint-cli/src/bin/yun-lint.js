#!/usr/bin/env node

import { program } from "commander";

import { pkg } from "../utils/constants.js";

import init from "../actions/init.js";

import log from "../utils/log.js";

program
  .version(pkg.version, "-v, --version")
  .description(
    `${pkg.name} 的目标是为了降低项目接入lint工具的门槛，节约lint工具搭建的时间，实现了【一键接入】【一键扫描】【一键修复】`
  );

program
  .command("init")
  .description("【一键接入】初始化依赖和配置，一键接入eslint和prettier")
  .action(() => {
    init();
  });

program
  .command("scan")
  .description("【一键扫描】扫描工程中潜在的问题")
  .action(() => {
    log.warn("暂未支持，敬请期待");
  });

program
  .command("fix")
  .description("【一键修复】自动修复工程中存在的问题")
  .action(() => {
    log.warn("暂未支持，敬请期待");
  });

program.parse(process.argv);
