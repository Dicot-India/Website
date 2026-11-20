import { cpSync, existsSync } from "node:fs";

if (!existsSync("vendor/autoload.php")) {
  throw new Error("Run composer install --no-dev --optimize-autoloader before building the deployment bundle.");
}

cpSync("vendor", "../vendor", { recursive: true, force: true });
