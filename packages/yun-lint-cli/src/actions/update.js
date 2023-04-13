import ora from "ora";

import { pkg } from "../utils/constants.js";

import { execSync } from "child_process";

let latestVersion = null;

// 检测版本是否最新
export const checkUpdate = async () => {
  const loading = ora(`[${pkg.version}] 正在检查最新版本...`);
  loading.start();

  try {
    latestVersion = execSync(`npm view ${pkg.name} version`)
      .toString("utf-8")
      .trim();
    loading.stop();
    if (pkg.version !== latestVersion) return true;
  } catch (error) {
    loading.stop();
    throw error;
  }

  return false;
};

// 更新版本
export const update = () => {
  const loading = ora(`[${pkg.name}] 存在新版本，将升级至 ${latestVersion}`);

  loading.start();

  try {
    execSync(`npm i -g ${pkg.name}`);
    loading.stop();
  } catch (error) {
    loading.stop();
    throw error;
  }
};
