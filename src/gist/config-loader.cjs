// Config Loader - Environment Configuration Manager
// Loads and validates configuration from multiple sources

const path = require("path");
const fs = require("fs");

class ConfigLoader {
  constructor(defaults = {}) {
    this.config = { ...defaults };
    this.validators = {};
    this.transforms = {};
  }

  addValidator(key, validatorFn) {
    this.validators[key] = validatorFn;
    return this;
  }

  addTransform(key, transformFn) {
    this.transforms[key] = transformFn;
    return this;
  }

  loadFromEnv(prefix = "APP_") {
    const envVars = Object.entries(process.env)
      .filter(([key]) => key.startsWith(prefix))
      .reduce((acc, [key, value]) => {
        const configKey = key
          .slice(prefix.length)
          .toLowerCase()
          .replace(/_([a-z])/g, (_, char) => char.toUpperCase());
        acc[configKey] = value;
        return acc;
      }, {});

    this.config = { ...this.config, ...envVars };
    return this;
  }

  loadFromFile(filePath) {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      console.warn(`Config file not found: ${absolutePath}`);
      return this;
    }

    const ext = path.extname(filePath);
    let fileConfig;

    if (ext === ".json") {
      const content = fs.readFileSync(absolutePath, "utf-8");
      fileConfig = JSON.parse(content);
    } else if (ext === ".js" || ext === ".cjs") {
      fileConfig = require(absolutePath);
    } else {
      throw new Error(`Unsupported config file format: ${ext}`);
    }

    this.config = { ...this.config, ...fileConfig };
    return this;
  }

  validate() {
    const errors = [];

    for (const [key, validator] of Object.entries(this.validators)) {
      const value = this.config[key];
      const result = validator(value, key);

      if (result !== true) {
        errors.push(`${key}: ${result || "validation failed"}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `Configuration validation failed:\n${errors.join("\n")}`
      );
    }

    return this;
  }

  transform() {
    for (const [key, transformFn] of Object.entries(this.transforms)) {
      if (this.config[key] !== undefined) {
        this.config[key] = transformFn(this.config[key]);
      }
    }
    return this;
  }

  get(key, defaultValue) {
    const keys = key.split(".");
    let value = this.config;

    for (const k of keys) {
      if (value === undefined || value === null) return defaultValue;
      value = value[k];
    }

    return value !== undefined ? value : defaultValue;
  }

  getAll() {
    return { ...this.config };
  }

  freeze() {
    this.config = Object.freeze({ ...this.config });
    return this;
  }
}

// Factory function
function createConfig(defaults) {
  return new ConfigLoader(defaults);
}

module.exports = { ConfigLoader, createConfig };
