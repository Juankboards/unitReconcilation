const fs = require('fs')
const readline = require('readline')
const ReconParser = require('./ReconParser.js')

async function reconcilationCheck (path) {
  try {
    return await generateUnitReconcilationReport(path)
  } catch (error) {
    console.log(error.message)
  }
}

/*
read recon.in as stream
*/
function generateUnitReconcilationReport (path) {
  const reconParser = ReconParser()
  const input = fs.createReadStream(path)
  const rl = readline.createInterface({ input, terminal: false })

  return new Promise((resolve, reject) => {
    rl.on('line', (line) => {
      reconParser.parseLine(line)
    })

    rl.on('close', () => {
      resolve(reconParser.end())
    })

    input.on('error', error => {
      reject(error)
    })
  })
}

module.exports = reconcilationCheck
