const fs = require("fs")
const path = require("path")
const { loadEnvConfig } = require("@next/env")

const appDir = path.join(__dirname)

loadEnvConfig(appDir)

// Tests always use `.env.local`, even if Next also loaded `.env.production`.
const envLocal = path.join(appDir, ".env.local")
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
}

const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./",
})

/** @type {import("jest").Config} */
const config = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/lib/data/jest.setup.ts"],
  testMatch: ["<rootDir>/src/lib/data/**/*.test.ts"],
}

module.exports = createJestConfig(config)
