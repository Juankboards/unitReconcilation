const reconcilationCheck = require('./reconcilationCheck.js')
const fs = require('fs')

async function reconOutGenerator (path) {
  try {
    console.log(await writeOutput(path))
    return
  } catch (error) {
    console.log(error.message)
  }
}

/*
write on recon.out the unit reconciliation report
*/
function writeOutput (path) {
  const output = fs.createWriteStream('./recon.out')

  return new Promise(async (resolve, reject) => {
    const reconciliationReport = await reconcilationCheck(path)
    let newLine = reconciliationReport.size

    for (const [symbol, shares] of reconciliationReport) {
      output.write(`${symbol} ${shares}`)
      newLine--
      if (newLine) output.write('\n')
    }

    output.end()

    output.on('error', error => {
      reject(error)
    })

    output.on('close', () => {
      resolve('recon.out generated')
    })
  })
}

module.exports = reconOutGenerator
