import { cpSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

for (const entry of readdirSync(".build")) {
  cpSync(join(".build", entry), join("..", entry), { recursive: true, force: true });
}

rmSync(".build", { recursive: true, force: true });
