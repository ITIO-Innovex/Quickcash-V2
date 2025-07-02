const fs = require('fs');
const path = require('path');
const toml = require('@iarna/toml');

const ENVIRONMENT = process.argv[2] || 'local';
const envTomlPath = path.join(__dirname, '..', '.env.toml');
const envPath = path.join(__dirname, '..', '.env');

const loadTomlConfig = (filePath, environment) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const config = toml.parse(fileContent);

    if (!config[environment]) {
      throw new Error(`Environment "${environment}" not found in .env.toml`);
    }

    return config[environment];
  } catch (error) {
    console.error('❌ Error loading TOML config:', error.message);
    process.exit(1);
  }
};

const generateEnvFile = (envObject, destPath) => {
  try {
    let envContent = '';

    for (const [key, value] of Object.entries(envObject)) {
      envContent += `${key}=${String(value)}\n`;
    }

    fs.writeFileSync(destPath, envContent);
    console.log('✅ .env file generated successfully!');
  } catch (error) {
    console.error('❌ Error writing .env file:', error.message);
    process.exit(1);
  }
};

const envConfig = loadTomlConfig(envTomlPath, ENVIRONMENT);
generateEnvFile(envConfig, envPath);
