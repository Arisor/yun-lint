import log from "../utils/log.js";

import { checkUpdate, update } from "./update.js";

import inquirer from "inquirer";

import { pkg, __dirname } from "../utils/constants.js";

import path from "path";

import fs from "fs-extra";

import glob from "glob";

import spawn from "cross-spawn";

import generateTemplate from "../utils/template.js";

export default async () => {
  try {
    const isOld = await checkUpdate();
    if (isOld) {
      update();
    } else {
      log.info(`当前没有可用的更新`);
    }

    const config = {};
    config.eslintType = await chooseEslintType();

    log.info(`Step ${++step}. 检查并处理项目中可能存在的依赖和配置冲突`);
    await changeDependenciesAndConfig(config);

    log.info(`Step ${++step}. 安装依赖`);
    spawn.sync("npm", ["i", "-D", pkg.name], { stdio: "inherit" });
    log.success(`Step ${step}. 安装依赖成功`);

    // 完成信息
    const logs = [`${pkg.name} 初始化完成`].join("\r\n");
    log.success(logs);
  } catch (error) {
    log.error(error);
  }
};

let step = 0;

// 选择项目类型
const chooseEslintType = async () => {
  const { type } = await inquirer.prompt({
    type: "list",
    name: "type",
    message: `Step ${++step}. 请选择项目类型：`,
    choices: [
      {
        name: "Vue2 项目（JavaScript）",
        value: "vue2",
      },
      {
        name: "Vue3 项目（JavaScript）",
        value: "vue3",
      },
      {
        name: "Node.js 项目（JavaScript）",
        value: "node",
      },
    ],
  });

  return type;
};

// 获取要移除的依赖
const getRemoveDependencies = (dependencies) => {
  // 精确移除依赖
  const willRemoveDependenciesName = [
    "@babel/eslint-parser",
    "babel-eslint",
    "eslint",
    "husky",
    "prettier",
  ];
  // 按前缀移除依赖
  const willRemoveDependenciesPrefix = ["eslint-"];
  return dependencies.filter(
    (name) =>
      willRemoveDependenciesName.some((n) => name === n) ||
      willRemoveDependenciesPrefix.some((prefix) => name.startsWith(prefix))
  );
};

// 获取要移除的配置文件
const getRemoveConfig = (cwd) => {
  return [
    ...glob.sync(".eslintrc?(.@(yaml|yml|json))", { cwd }),
    ...glob.sync(
      ".prettierrc?(.@(cjs|config.js|config.cjs|yaml|yml|json|json5|toml))",
      { cwd }
    ),
  ];
};

// 获取要覆盖的文件
const getReWriteConfig = (cwd) => {
  return glob
    .sync("**/*.ejs", { cwd: path.resolve(__dirname, "../config") })
    .map((name) => name.replace(/^_/, ".").replace(/\.ejs$/, ""))
    .filter((filename) => fs.existsSync(path.resolve(cwd, filename)));
};

// 变更依赖和配置文件
const changeDependenciesAndConfig = async (config) => {
  const cwd = process.cwd(); // 获取命令执行的目录
  const workspacePkgPath = path.resolve(cwd, "package.json");
  const workspacePkg = fs.readJSONSync(workspacePkgPath);
  const dependencies = [
    ...Object.keys(workspacePkg.dependencies || {}),
    ...Object.keys(workspacePkg.devDependencies || {}),
  ];
  const binName = Object.keys(pkg.bin)[0];

  const willRemoveDependencies = getRemoveDependencies(dependencies);
  const willRemoveConfig = getRemoveConfig(cwd);
  const willRewriteConfig = getReWriteConfig(cwd);

  const willChangeCount =
    willRemoveDependencies.length +
    willRemoveConfig.length +
    willRewriteConfig.length;
  if (willChangeCount > 0) {
    log.warn(
      `检测到项目中存在可能与 ${pkg.name} 冲突的依赖和配置，为保证正常运行将`
    );

    if (willRemoveDependencies.length > 0) {
      log.warn("删除以下依赖：");
      log.warn(JSON.stringify(willRemoveDependencies, null, 2));
    }

    if (willRemoveConfig.length > 0) {
      log.warn("删除以下配置文件：");
      log.warn(JSON.stringify(willRemoveConfig, null, 2));
    }

    if (willRewriteConfig.length > 0) {
      log.warn("覆盖以下配置文件：");
      log.warn(JSON.stringify(willRewriteConfig, null, 2));
    }

    const { isOverWrite } = await inquirer.prompt({
      type: "confirm",
      name: "isOverWrite",
      message: "请确认是否继续：",
    });

    if (!isOverWrite) process.exit(0);
  }

  // 修改package.json
  for (const name of willRemoveDependencies) {
    delete (workspacePkg.dependencies || {})[name];
    delete (workspacePkg.devDependencies || {})[name];
  }
  if (!workspacePkg.scripts) {
    workspacePkg.scripts = {};
  }
  if (!workspacePkg.scripts[`${binName}-scan`]) {
    workspacePkg.scripts[`${binName}-scan`] = `${binName} scan`;
  }
  if (!workspacePkg.scripts[`${binName}-fix`]) {
    workspacePkg.scripts[`${binName}-fix`] = `${binName} fix`;
  }
  fs.writeFileSync(
    workspacePkgPath,
    JSON.stringify(workspacePkg, null, 2),
    "utf8"
  );

  // 删除配置文件
  for (const name of willRemoveConfig) {
    fs.removeSync(path.resolve(cwd, name));
  }

  // 生成新的配置文件
  log.info(`Step ${++step}. 写入配置文件`);
  generateTemplate(cwd, config);
  log.success(`Step ${step}. 写入配置文件成功`);
};
