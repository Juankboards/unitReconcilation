const fs = require('fs')
const reconOutGenerator = require('./reconOutGenerator.js')

const path = process.argv[2]
try {
  if (!fs.existsSync(path) || !fs.statSync(path).isFile()) throw new Error('Incorrect path')
  reconOutGenerator(path)
} catch (error) {
  console.log(error.message)
}
