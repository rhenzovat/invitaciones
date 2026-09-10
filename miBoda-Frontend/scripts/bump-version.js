import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const pkgPath = path.join(rootDir, "package.json");
const envPath = path.join(rootDir, ".env");

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const parts = pkg.version.split(".").map(Number);
parts[2] = (parts[2] || 0) + 1;
const newVersion = parts.join(".");

pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");

let envContent = "";
try {
  envContent = readFileSync(envPath, "utf8");
} catch {
  envContent = "";
}
const versionEnv = `VITE_APP_VERSION=V.${newVersion}`;
if (/VITE_APP_VERSION=.*/m.test(envContent)) {
  envContent = envContent.replace(/VITE_APP_VERSION=.*/m, versionEnv);
} else {
  envContent = envContent.trimEnd() + (envContent ? "\n" : "") + versionEnv + "\n";
}
writeFileSync(envPath, envContent, "utf8");

console.log("Version bumped to", newVersion, "| VITE_APP_VERSION=V." + newVersion);
