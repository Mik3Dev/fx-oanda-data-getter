const express = require('express');
const app = express();
const logger = require('morgan');
const proxy = require('express-http-proxy');
const mongoose = require('mongoose');
const _ = require('lodash');

const oanda = require('./commons/oandaConnection');
const config = require('./config/config');
const port = process.env.PORT || config.PORT;

const Candle = require('./commons/candleObject');
const candleModel = require('./models/candle');
const timeframes = require('./commons/timeFrames');
const instruments = require('./commons/instruments');

mongoose.connect(config.DATABASE_URL, {
    'useNewUrlParser': true
}).then(
    () => console.log('Database connection is ready!'),
    err => console.log('Ups, something went wrong. Can not connect to database.')
);


express()
    .use(logger('dev'))
    .get('/', (req, res) => {
        const counts = {};
        candleModel.count({'timeframe': 'S30'}).then(count => {
            counts.S30 = count;
            candleModel.count({'timeframe': 'M5'}).then(count => {
                counts.M5 = count;
                candleModel.count({'timeframe': 'M15'}).then(count => {
                    counts.M15 = count;
                    candleModel.count({'timeframe': 'H1'}).then(count => {
                        counts.H1 = count;
                        res.send(counts);
                    });
                });
            });
        }).catch(e => {
            counts='Ups! Something went wrong. Contact me miguel.acosta1978@gmail.com';
            res.send(counts);
        });
    })
    .use('/app', proxy(config.proxy))
    .listen(port, () => {
        console.log(`The app is running on port: ${port}`);
        setInterval(() => {
            _.forEach(instruments, instrument => {
                _.forEach(timeframes, timeframe => {
                    oanda.getCandles(instrument, timeframe, config.nQueryCandles)
                    .then(resp => {
                        _.forEach(resp.data.candles, (item) => {
                            const candle = new Candle(resp.data.instrument, resp.data.granularity, item);
                            candle.saveCandle();
                        });
                    }).catch((e) => {
                        console.log('Error on Index');
                    });
                })
            })
        }, config.timer)
    });