import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "pets",
        "vet-visits",
        "stock",
        "auth",
        "api",
        "ui",
        "db",
        "config",
        "reminders",
        "notifications",
        "household",
        "calendar",
        "spending",
        "deps",
      ],
    ],
    "scope-empty": [1, "never"],
  },
};

export default config;
