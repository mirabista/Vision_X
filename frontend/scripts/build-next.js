const { spawnSync } = require("child_process");

process.env.NODE_ENV = "production";

const result = spawnSync("next", ["build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

process.exit(result.status ?? 1);
