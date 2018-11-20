const express = require('express');
const logger = require('morgan');
const proxy = require('express-http-proxy');
const mongoose = require('mongoose');
const _ = require('lodash');
const cors = require('cors');

const oanda = require('./commons/oandaConnection');
const config = require('./config/config');
const port = process.env.PORT || config.PORT;

const Candle = require('./commons/candleObject');
const candleModel = require('./models/candle');
const instruments = require('./commons/instruments');

mongoose.connect(config.DATABASE_URL, {
    'useNewUrlParser': true
}).then(
    () => console.log('Database connection is ready!'),
    err => console.log('Ups, something went wrong. Can not connect to database.')
);


express()
    .use(logger('dev'))
    .use(cors({
        'origin': config.ORIGIN
    }))
    .get('/', (req, res) => {
        timeframe= config.TIMEFRAME;
        candleModel.count({'timeframe': timeframe}).then(count => {
            res.send({
                [timeframe]: count
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
                oanda.getCandles(instrument, config.TIMEFRAME, config.nQueryCandles)
                .then(resp => {
                    _.forEach(resp.data.candles, (item) => {
                        const candle = new Candle(resp.data.instrument, resp.data.granularity, item);
                        candle.saveCandle();
                    });
                }).catch((e) => {
                    console.log('Error on Index');
                });
            })
        }, config.timer)
    });