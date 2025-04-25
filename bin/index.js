#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  const args = process.argv.slice(2).join(' ');
  const cwd = process.cwd();

  // Ruta por defecto a la config y extensión desde el paquete
  const defaultConfig = path.resolve(__dirname, '../jest.config.json');
  const defaultSetup = path.resolve(__dirname, '../jest-image-snapshot-extend.js');

  // Detectar si hay configuración del usuario
  const userConfigJS = path.join(cwd, 'jest.config.js');
  const userConfigJSON = path.join(cwd, 'jest.config.json');

  const configPath = fs.existsSync(userConfigJS)
    ? userConfigJS
    : fs.existsSync(userConfigJSON)
      ? userConfigJSON
      : defaultConfig;

  const setupArg = fs.existsSync(defaultSetup)
    ? `--setupFilesAfterEnv ${defaultSetup}`
    : '';

  if (configPath === defaultConfig) {
    console.log('🧪 Usando configuración por defecto de @zumerbox/tests');
  } else {
    console.log(`🧪 Usando configuración personalizada: ${path.basename(configPath)}`);
  }

  execSync(`jest --rootDir ${cwd} -c ${configPath} ${setupArg} ${args}`, {
    stdio: 'inherit',
  });

} catch (error) {
  console.error('❌ Jest terminó con errores. Corregí y volvé a intentar.');
  process.exit(1);
}
