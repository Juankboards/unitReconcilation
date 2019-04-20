const BigNumber = require('bignumber.js')

const Records = () => {
  let records = {} //store the expected final state
  let unitReconcilation = new Map() //store the unit reconciliation fails
  let initialRecords = new Set() //keep track of shares on records not found on D1-POS

  const registerUnitReconcilation = (symbol, shares, prevPos) => {
    const newShareValue = prevPos.multipliedBy(-1).plus(shares)
    if (newShareValue.isZero()) return
    unitReconcilation.set(symbol, +newShareValue)
  }

  const parseSharesValue = (symbol) => {
    return new BigNumber(records[symbol] || 0)
  }

  return ({
    getRecords () {
      return Object.assign({}, records)
    },
    /*
    add record from D0-POS to records
    */
    addInitialRecord (symbol, shares) {
      if (!symbol || shares === undefined) return false
      records[symbol] = +shares
      return true
    },
    /*
    register difference between D1-POS and records on unitReconcilation
    */
    unitReconcilationCheck (symbol, shares) {
      const prevPos = parseSharesValue(symbol)
      registerUnitReconcilation(symbol, shares, prevPos)
      initialRecords.delete(symbol)
      return [symbol, unitReconcilation.get(symbol) || 0]
    },
    /*
    process D1-TRN
    */
    processTransaction (symbol, transactionType, shares, value) {
      if (!symbol || !transactionType || shares === undefined || value === undefined) return false

      const prevPos = parseSharesValue(symbol)
      const prevCash = parseSharesValue('Cash')

      if (transactionType === 'SELL') records[symbol] = +prevPos.minus(shares)
      if (transactionType === 'BUY') records[symbol] = +prevPos.plus(shares)
      if (transactionType === 'SELL' || transactionType === 'DEPOSIT' || transactionType === 'DIVIDEND') records['Cash'] = +prevCash.plus(value)
      if (transactionType === 'BUY' || transactionType === 'WITHDRAWAL' || transactionType === 'FEE') records['Cash'] = +prevCash.minus(value)

      return true
    },
    /*
    keep track of shares registered on records
    */
    observeInitialRecords () {
      initialRecords = new Set(Object.keys(records))
      return true
    },
    /*
    register the error of shares not registered on D1-TRN or D1-POS and return unitReconcilation
    */
    unitReconcilationReport () {
      for (const symbol of initialRecords) {
        const shares = new BigNumber(0)
        const prevPos = parseSharesValue(symbol)
        registerUnitReconcilation(symbol, shares, prevPos)
      }
      initialRecords = new Set()
      return new Map(unitReconcilation)
    }
  })
}

module.exports = Records
