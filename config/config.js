require('dotenv').load();
const numerOfRetrievingCandles = process.env.numerOfRetrievingCandles;
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
const OANDA_TOKEN = process.env.OANDA_TOKEN;
const timer = process.env.timer;
const stochLowerLimit = process.env.stochLowerLimit;
const stochHigherLimit = process.env.stochHigherLimit;

module.exports =  {
    PORT: 3000,
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
    stochHigherLimit
}