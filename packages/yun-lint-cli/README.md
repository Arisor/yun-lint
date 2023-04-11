# `yun-lint-cli`

> TODO: yun-lint-cli 的目标是为了降低项目接入 lint 工具的门槛，节约 lint 工具搭建的时间，实现了【一键接入】【一键扫描】【一键修复】

### 安装

```
npm install -g @arisor/yun-lint-cli
# OR
yarn global add @arisor/yun-lint-cli
```

### 使用

【一键接入】初始化依赖和配置，一键接入 eslint 和 prettier

```
yun-lint init
```

【一键扫描】扫描工程中潜在的问题

```
yun-lint scan
```

【一键修复】自动修复工程中存在的问题

```
yun-lint fix
```
