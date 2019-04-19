const BigNumber = require('bignumber.js')

const Records = () => {
  let records = {}
  let unitReconcilation = new Map()
  let initialRecords = new Set()

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
    addInitialRecord (symbol, shares) {
      if (!symbol || shares === undefined) return false
      records[symbol] = +shares
      return true
    },
    unitReconcilationCheck (symbol, shares) {
      const prevPos = parseSharesValue(symbol)
      registerUnitReconcilation(symbol, shares, prevPos)
      initialRecords.delete(symbol)
      return [symbol, unitReconcilation.get(symbol) || 0]
    },
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
    observeInitialRecords () {
      initialRecords = new Set(Object.keys(records))
      return true
    },
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
