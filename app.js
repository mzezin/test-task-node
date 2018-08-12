var axios = require("axios")
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json({
    type: '*/*'
}))
app.use((err, req, res, next) => {
    if (err) {
        res.status(500).send('Internal server error')
    } else {
        next()
    }
})

var getSymbol = (symbol) => {
    return new Promise((resolve, reject) => {
        axios.get('https://api.iextrading.com/1.0/stock/' + symbol + '/quote')
            .then(res => {
                var out = {}
                out.latestPrice = res.data.latestPrice
                out.sector = res.data.sector
                resolve(out)
            })
            .catch(err => {
                var out = {}
                out.latestPrice = 0
                out.sector = 'No data'
                resolve(out)
            })
    })
}

var enrichOne = (pos) => {
    return new Promise((resolve, reject) => {
        getSymbol(pos.symbol)
            .then(r => {
                var out = r
                out.symbol = pos.symbol
                out.volume = pos.volume
                resolve(out)
            })
            .catch(err => reject(err))
    })
}

var enrichPositions = (positions) => {
    return Promise.all(positions.stocks.map(e => enrichOne(e)))
}

var calculateAllocations = (data) => {
    var out = {}
    out.value = data.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.latestPrice * currentValue.volume
    }, 0);
    var possibleSectors = new Set(data.map(e => e.sector))
    out.allocations = []
    possibleSectors.forEach(e => {
        var secAlloc = {}
        secAlloc.sector = e
        secAlloc.assetValue = data.reduce((accumulator, currentValue) => {
            return accumulator + (currentValue.sector == e ? currentValue.latestPrice * currentValue.volume : 0)
        }, 0);
        secAlloc.proportion = secAlloc.assetValue / out.value
        out.allocations.push(secAlloc)
    })
    return out
}

app.get('/', (req, res) => {
    res.status(200).send('try POST or GET /{ticker}')
})

app.get('/:symbol', (req, res) => {
    getSymbol(req.params.symbol)
        .then(r => res.status(200).send(r))
})

app.post('/', (req, res) => {
    if (req.body === undefined || req.body.stocks === undefined) {
        res.status(500).send('Internal server error: empty JSON')
    }
    enrichPositions(req.body)
        .then(r => {
            res.status(200).send(calculateAllocations(r))
        })
        .catch(err => res.status(500).send('Internal server error'))
})

app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})