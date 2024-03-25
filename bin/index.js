#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')
try {
  const args = process.argv.slice(2).join(' ')
  const filesPath = process.cwd();
  const configPath = path.resolve(__dirname, '../jest.config.json')
  const imageJestPath = path.resolve(__dirname, '../jest-image-snapshot-extend.js')
  execSync(`jest --rootDir ${filesPath} -c ${configPath} --setupFilesAfterEnv ${imageJestPath} ${args}`, {
    stdio: 'inherit'
  })

} catch (error) {
  console.log('Jest ended with errors. Fix and start again')
}
