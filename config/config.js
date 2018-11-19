require('dotenv').load();
const numerOfRetrievingCandles = process.env.numerOfRetrievingCandles;
const OANDA_TOKEN = process.env.OANDA_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL
const shortStochPeriod = process.env.shortStochPeriod;
const longStochPeriod = process.env.longStochPeriod;
const stochSmoothD = process.env.stochSmoothD;
const smaPeriod = process.env.smaPeriod;
const emaPeriod = process.env.emaPeriod;
const wmaPeriod = process.env.wmaPeriod;
const bolBandPeriod = process.env.bolBandPeriod;
const bolBandStdDev = process.env.bolBandStdDev;
const AOShortPeriod = process.env.AOShortPeriod;
const AOLongPeriod = process.env.AOLongPeriod;
const OandaApiBaseURL = process.env.OandaApiBaseURL;
const nQueryCandles = process.env.nQueryCandles;
const timer = process.env.timer;
const stochLowerLimit = process.env.stochLowerLimit;
const stochHigherLimit = process.env.stochHigherLimit;
const proxy = process.env.proxy;
const ORIGIN = process.env.ORIGIN;


module.exports =  {
    PORT: 7000,
    DATABASE_URL,
    OANDA_TOKEN,
    timer,
    nQueryCandles,
    OandaApiBaseURL,
    OANDA_TOKEN,
    /* -- Historical price parameter to analysis --*/
    numerOfRetrievingCandles,
    shortStochPeriod,
    longStochPeriod,
    stochSmoothD,
    smaPeriod,
    emaPeriod,
    wmaPeriod,
    bolBandPeriod,
    bolBandStdDev,
    AOShortPeriod,
    AOLongPeriod,
    stochLowerLimit,
    stochHigherLimit,
    proxy,
    ORIGIN
}