const CandleModel = require('../models/candle');
const oanda = require('./oandaConnection');
const config = require('../config/config');
const moment = require('moment');
const _ = require('lodash');

function calcStoch(serie, k=config.longStochPeriod, d=config.stochSmoothD){
    let stochArray = _.map(serie, (item, index) => {
        if(index < serie.length-d) return 0;
        else {
            let subSerie = [];
            let close;
            for(let i=index; i>index-k; i--){
                if(i==index) close = serie[i].close;
                subSerie.push(serie[i]);
            }
            return ((close - _.minBy(subSerie, 'low').low) / (_.maxBy(subSerie, 'high').high - _.minBy(subSerie, 'low').low)) * 100;
        }
    });
    let sum = 0;
    for(let i=stochArray.length-1; i>=stochArray.length-d; i--){
        sum+=stochArray[i];
    }
    return sum/d;
}

function calcEma(serie, period=config.emaPeriod){
    const kFactor = 2/(period+1);
    let previousEma = 0;
    const emaArray = _.map(serie, (item, index) => {
        if(index == 0){
            previousEma = item.close;
            return item.close;
        } else {
            const ema = (item.close * kFactor) + (previousEma * (1-kFactor));
            previousEma = ema;
            return ema;
        }
    });
    return emaArray[emaArray.length - 1];
}

function calcWma(serie, period=config.wmaPeriod){
    let sum = 0;
    let total = 0;
    let count = 0;
    for(let i=1; i<=period; i++){
        total += i;
    }
    for(let i=serie.length-period; i<serie.length; i++){
        count++;
        sum += serie[i].close*(count/total);
    }
    return sum;
}

function calcSma(serie, period=config.smaPeriod){
    let sum = 0;
    for(let i=serie.length-period; i<serie.length; i++){
        sum += Number.parseFloat(serie[i].close);
    }
    return sum/period;
}

function calcBolBand(serie, period=config.bolBandPeriod, stdDev=config.bolBandStdDev){
    const mean = calcSma(serie, period);
    let sum = 0;
    for(let i=serie.length-period; i<serie.length; i++){
        sum += Math.pow((serie[i].close - mean), 2);
    }
    const variance = sum / period;
    const sd = stdDev * Math.sqrt(variance);
    return {
        bolBand: mean,
        upperBand: mean + sd,
        lowerBand: mean - sd,
    }
}

function calcAwesomeOsc(serie, longPeriod=config.AOLongPeriod, shortPeriod=config.AOShortPeriod){
    let sum = 0;
    for(let i=serie.length-longPeriod; i<serie.length; i++){
        sum += (serie[i].high + serie[i].low)/2;
    }
    const longSma = sum / longPeriod;

    sum = 0;
    for(let i=serie.length-shortPeriod; i<serie.length; i++){
        sum += (serie[i].high + serie[i].low)/2;
    }
    const shortSma = sum / shortPeriod;

    return shortSma - longSma;
}

class Candle {

    constructor (instrument, timeframe, candle){
        this.instrument = instrument;
        this.timeframe = timeframe;
        this.complete = candle.complete;
        this.volume = candle.volume;
        this.time = candle.time;
        this.open = candle.mid.o;
        this.high = candle.mid.h;
        this.low = candle.mid.l
        this.close = candle.mid.c;
    }

    saveCandle(){
        CandleModel.findOne({
            'instrument': this.instrument,
            'timeframe': this.timeframe,
            'time': this.time
        }).then(data => {
            if(!data){
                oanda.getCandlesToCalculate(this.instrument, this.timeframe, config.numerOfRetrievingCandles , this.time)
                .then(resp => {
                    const priceArray = _.map(resp.data.candles, candle => {
                        return {
                            date: candle.time,
                            open: Number.parseFloat(candle.mid.o),
                            high: Number.parseFloat(candle.mid.h),
                            low: Number.parseFloat(candle.mid.l),
                            close: Number.parseFloat(candle.mid.c)
                        }
                    });
                    priceArray.push({
                        date: this.time,
                        open: Number.parseFloat(this.open),
                        high: Number.parseFloat(this.high),
                        low: Number.parseFloat(this.low),
                        close: Number.parseFloat(this.close),
                    })

                    const indicatorStochLong = calcStoch(priceArray, config.longStochPeriod);
                    const indicatorStochShort = calcStoch(priceArray, config.shortStochPeriod);
                    const indicatorEma = calcEma(priceArray, config.emaPeriod);
                    const indicatorSma = calcSma(priceArray, config.smaPeriod);
                    const indicatorWma = calcWma(priceArray, config.wmaPeriod);
                    const indicatorBolBand = calcBolBand(priceArray, config.bolBandPeriod, config.bolBandStdDev);
                    const indicatorAwesomeOsc = calcAwesomeOsc(priceArray, config.AOLongPeriod, config.AOShortPeriod);
                    
                    const newCandle = new CandleModel({
                        'instrument': this.instrument,
                        'timeframe': this.timeframe,
                        'complete': this.complete,
                        'volume': this.volume,
                        'time': this.time,                                 
                        'open': this.open,
                        'high': this.high,
                        'low': this.low,
                        'close': this.close,
                        'indicatorStochLong': indicatorStochLong,
                        'indicatorStochShort': indicatorStochShort,
                        'indicatorEma': indicatorEma,
                        'indicatorWma': indicatorWma,
                        'indicatorSma': indicatorSma,
                        'indicatorBolBand': indicatorBolBand.bolBand,
                        'indicatorUpperBand': indicatorBolBand.upperBand,
                        'indicatorLowerBand': indicatorBolBand.lowerBand,
                        'indicatorAwesomeOsc': indicatorAwesomeOsc,
                    });
                    newCandle.save()
                    .then(r => {
                        console.log(`Register ${r._id} successfully created`);
                    }).catch(e => console.log(`Unabled to store the ${this.instrument} - ${this.time} candle in timeframe ${this.timeframe}`));
                }).catch(e => console.log(`Problem to fetch ${this.instrument} - ${this.time} candle in timeframe ${this.timeframe}`));
            } else {
                if(!data.complete){
                    oanda.getCandlesToCalculate(this.instrument, this.timeframe, config.numerOfRetrievingCandles , this.time)
                    .then(resp => {
                        const priceArray = _.map(resp.data.candles, candle => {
                            return {
                                date: candle.time,
                                open: Number.parseFloat(candle.mid.o),
                                high: Number.parseFloat(candle.mid.h),
                                low: Number.parseFloat(candle.mid.l),
                                close: Number.parseFloat(candle.mid.c)
                            }
                        });
                        priceArray.push({
                            date: this.time,
                            open: Number.parseFloat(this.open),
                            high: Number.parseFloat(this.high),
                            low: Number.parseFloat(this.low),
                            close: Number.parseFloat(this.close),
                        });

                        const indicatorStochLong = calcStoch(priceArray, config.longStochPeriod);
                        const indicatorStochShort = calcStoch(priceArray, config.shortStochPeriod);
                        const indicatorEma = calcEma(priceArray, config.emaPeriod);
                        const indicatorSma = calcSma(priceArray, config.smaPeriod);
                        const indicatorWma = calcWma(priceArray, config.wmaPeriod);
                        const indicatorBolBand = calcBolBand(priceArray, config.bolBandPeriod, config.bolBandStdDev);
                        const indicatorAwesomeOsc = calcAwesomeOsc(priceArray, config.AOLongPeriod, config.AOShortPeriod);
                        
                        CandleModel.findOneAndUpdate({
                            'instrument': this.instrument,
                            'timeframe': this.timeframe,
                            'time': this.time
                        }, {
                            'complete': this.complete,
                            'volume': this.volume,
                            'open': this.open,
                            'high': this.high,
                            'low': this.low,
                            'close': this.close,
                            'indicatorStochLong': indicatorStochLong,
                            'indicatorStochShort': indicatorStochShort,
                            'indicatorEma': indicatorEma,
                            'indicatorWma': indicatorWma,
                            'indicatorSma': indicatorSma,
                            'indicatorBolBand': indicatorBolBand.bolBand,
                            'indicatorUpperBand': indicatorBolBand.upperBand,
                            'indicatorLowerBand': indicatorBolBand.lowerBand,
                            'indicatorAwesomeOsc': indicatorAwesomeOsc,
                        }).then(r => {
                            console.log(`Register ${r._id} successfully updated`);
                        }).catch(e => console.log(`Unabled to store the ${this.instrument} - ${this.time} candle in timeframe ${this.timeframe}`))
                    }).catch(e => console.log(`Problem to fetch ${this.instrument} - ${this.time} candle in timeframe ${this.timeframe}`));
                } else {
                    console.log(`Register id: ${data._id} already exist!`)
                }
            }
        }).catch(e => {
            console.log(`Error saving candle ${this.instrument} - ${this.timeframe} - ${this.time}`);
        });
    }
}

module.exports = Candle;