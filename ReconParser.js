const Records = require('./Records.js')

const ReconParser = () => {
  let initialValues = false // check if registering records from D0-POS or D1-POS
  let records = Records()

  /*
  called when no space on line
    D0-POS
    D1-TRN
    D1-POS
  */
  const parseSection = (lineValues) => {
    initialValues = false
    const [day, registerType] = lineValues[0].split('-')
    if (day === 'D0' && registerType === 'POS') initialValues = true
    if (day !== 'D0' && registerType === 'POS') records.observeInitialRecords()
    return { type: 'section', values: [day, registerType] }
  }

  /*
  called when 1 space on line
    SYMBOL SHARES
  */
  const parsePositionRecord = (lineValues) => {
    const [symbol, shares] = lineValues
    if (initialValues) records.addInitialRecord(symbol, shares)
    if (!initialValues) records.unitReconcilationCheck(symbol, shares)
    return { type: 'position', values: [symbol, shares] }
  }

  /*
  called when 3 space on line
    SYMBOL TRANSACTION SHARES VALUE
  */
  const parseTransactionRecord = (lineValues) => {
    const [symbol, transactionType, shares, value] = lineValues
    records.processTransaction(symbol, transactionType, shares, value)
    return { type: 'transaction', values: [symbol, transactionType, shares, value] }
  }

  return ({
    parseLine (line) {
      const lineValues = line.split(' ')
      if (lineValues.length === 1) return parseSection(lineValues)
      if (lineValues.length === 2) return parsePositionRecord(lineValues)
      if (lineValues.length === 4) return parseTransactionRecord(lineValues)
    },
    end () {
      return records.unitReconcilationReport()
    }
  })
}

module.exports = ReconParser
