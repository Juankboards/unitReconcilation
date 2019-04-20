# Unit reconcilation check

A JavaScript program for unit reconcilation reports. 

## Load

To run Unit reconcilation check and generate recon.out you have to clone this repository

```bash
git clone https://github.com/Juankboards/unitReconcilation.git
```

install all dependencies

```bash
npm install
```

## Use

To generate recon.out use 

```bash
npm start PATH
```

PATH = path to recon.in file

## Input 

Reads from recon.in file

```
recon.in
--------
D0-POS
SYMBOL SHARES
.
.
.
D1-TRN
SYMBOL TRANSACTION SHARES VALUE
.
.
.
D1-POS
SYMBOL SHARES
```

SYMBOL = Company symbol
SHARES = Company shares amount
TRANSACTION = Transaction type
VALUE = Transaction total value in dollars

## Output

Generates recon.out

```
recon.out
---------
SYMBOL SHARES
```

SYMBOL = Company symbol
SHARES = Company shares amount

## Test

The index.test.js file contains the test scripts for each method.

The tests can be run with Node.js using

```bash
npm test
```


