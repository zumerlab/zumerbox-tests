#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')
try {
  const args = process.argv.slice(2).join(' ')
  console.log('hola')
  const jestCmd = path.resolve(__dirname, '../node_modules/.bin/jest');
  const configPath = path.resolve(__dirname, '../jest.config.json')
  const result = execSync(`jest -c ${configPath} ${args}`, {
    stdio: 'inherit'
  })

} catch (error) {
  console.log('Jest ended with errors. Fix and start again')
}
