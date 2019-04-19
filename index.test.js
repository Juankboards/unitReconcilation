/* eslint-env jest */
const fs = require('fs')
const path = require('path')
const reconcilationCheck = require('./reconcilationCheck.js')
const reconOutGenerator = require('./reconOutGenerator.js')
const Records = require('./Records.js')
const ReconParser = require('./ReconParser.js')

describe('Records class', () => {
  test('Add an initial records when symbol and shares are passed', () => {
    const records = Records()
    records.addInitialRecord('AAPL', 300)
    records.addInitialRecord('GOOG', 1000)
    const expected = {
      'AAPL': 300,
      'GOOG': 1000
    }
    expect(records.getRecords()).toStrictEqual(expected)
  })

  test('Do not add initial record when symbol and/or shares are not passed', () => {
    const records = Records()
    records.addInitialRecord('AAPL', 300)
    records.addInitialRecord('GOOG', '1000')
    records.addInitialRecord()
    records.addInitialRecord(1000)
    records.addInitialRecord('MSFT')
    const expected = {
      'AAPL': 300,
      'GOOG': 1000
    }
    expect(records.getRecords()).toStrictEqual(expected)
  })

  test('Process transaction record when symbol, transactionType, shares and value are passed', () => {
    const records = Records()
    records.addInitialRecord('AAPL', 300)
    records.addInitialRecord('GOOG', 1000.73)
    records.processTransaction('AAPL', 'SELL', 300, 600)
    records.processTransaction('GOOG', 'BUY', 200, 200)
    records.processTransaction('MSFT', 'SELL', 100, 100)
    records.processTransaction('SP500', 'BUY', 200, 200)

    const expected = {
      'AAPL': 0,
      'GOOG': 1200.73,
      'Cash': 300,
      'MSFT': -100,
      'SP500': 200
    }
    expect(records.getRecords()).toStrictEqual(expected)
  })

  test('Do not process transaction record when symbol, transactionType, shares and/or value are not passed', () => {
    const records = Records()
    records.addInitialRecord('AAPL', 300)
    records.addInitialRecord('GOOG', 1000)
    records.processTransaction('AAPL', 'SELL', 300, 600)
    records.processTransaction('GOOG', 'BUY', 200)
    records.processTransaction('SELL', 100, 100)
    records.processTransaction()

    const expected = {
      'AAPL': 0,
      'GOOG': 1000,
      'Cash': 600
    }
    expect(records.getRecords()).toStrictEqual(expected)
  })

  test('Find unit reconcilation check when a symbol already in records and value are passed', () => {
    const records = Records()
    records.addInitialRecord('AAPL', 300)
    records.addInitialRecord('GOOG', 1000)

    const actual = records.unitReconcilationCheck('AAPL', 400)
    const expected = ['AAPL', 100]

    expect(actual).toMatchObject(expected)
  })

  test('Find unit reconcilation check when a symbol not in records and value are passed', () => {
    const records = Records()
    records.addInitialRecord('AAPL', 300)
    records.addInitialRecord('GOOG', 1000)

    const actual = records.unitReconcilationCheck('MSFT', -300)
    const expected = ['MSFT', -300]

    expect(actual).toMatchObject(expected)
  })
})

describe('Recon parser class', () => {
  test('Parse line as section', () => {
    const reconParser = ReconParser()
    const expected = {
      type: 'section',
      values: ['D0', 'POS']
    }
    expect(reconParser.parseLine('D0-POS')).toStrictEqual(expected)
  })

  test('Parse line as position', () => {
    const reconParser = ReconParser()
    const expected = {
      type: 'position',
      values: ['AAPL', '-100']
    }
    expect(reconParser.parseLine('AAPL -100')).toStrictEqual(expected)
  })

  test('Parse line as transaction', () => {
    const reconParser = ReconParser()
    const expected = {
      type: 'transaction',
      values: ['GOOG', 'SELL', '300', '2500']
    }
    expect(reconParser.parseLine('GOOG SELL 300 2500')).toStrictEqual(expected)
  })

  test('Return parsed unit reconcilation report map from recon.in', () => {
    const reconParser = ReconParser()
    const fails = {
      'Cash': 8000,
      'GOOG': 10,
      'TD': -100,
      'MSFT': 10
    }
    const expected = new Map(Object.entries(fails))
    reconParser.parseLine('D0-POS')
    reconParser.parseLine('AAPL 100')
    reconParser.parseLine('GOOG 200')
    reconParser.parseLine('SP500 175.4')
    reconParser.parseLine('Cash 1000')
    reconParser.parseLine('D1-TRN')
    reconParser.parseLine('AAPL SELL 100 30000')
    reconParser.parseLine('GOOG BUY 10 10000')
    reconParser.parseLine('Cash DEPOSIT 0 1000')
    reconParser.parseLine('Cash FEE 0 50')
    reconParser.parseLine('GOOG DIVIDEND 0 50')
    reconParser.parseLine('TD BUY 100 10000')
    reconParser.parseLine('D1-POS')
    reconParser.parseLine('GOOG 220')
    reconParser.parseLine('SP500 175.4')
    reconParser.parseLine('Cash 20000')
    reconParser.parseLine('MSFT 10')
    expect(reconParser.end()).toStrictEqual(expected)
  })
})

describe('Recociliation check', () => {
  test('Get reconciliation fails from recon.in', async () => {
    const fails = {
      'Cash': 8000,
      'GOOG': 10,
      'TD': -100,
      'MSFT': 10
    }
    const expected = new Map(Object.entries(fails))
    expect.assertions(1)
    const data = await reconcilationCheck(path.join(__dirname, '/recon.in'))
    expect(data).toStrictEqual(expected)
  })
})

describe('recon.out generator', () => {
  test('generate recon.out from recon.in', async () => {
    const expected = 'GOOG 10\nCash 8000\nMSFT 10\nTD -100'
    expect.assertions(1)
    await reconOutGenerator(path.join(__dirname, '/recon.in'))
    expect(fs.readFileSync('./recon.out').toString()).toMatch(expected)
  })
})
