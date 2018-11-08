const axios = require('axios');
const _ = require('lodash');
require('dotenv').load();
const token = process.env.OANDA_TOKEN;

module.exports =  {
    baseURL: '	https://api-fxpractice.oanda.com',
    getCandles(instrument, timeFrame, count=100){
        const connectionString = `${this.baseURL}/v3/instruments/${instrument}/candles?granularity=${timeFrame}&count=${count}`;
        return axios({
            method: 'get',
            url: connectionString,
            headers: {
                'Authorization': `Bearer ${token}`,
                'content-type': 'Application/json'
            }
        });
    },
    getCandlesToCalculate(instrument, timeFrame, count=100, time=Date.now){
        const connectionString = `${this.baseURL}/v3/instruments/${instrument}/candles?granularity=${timeFrame}&count=${count}&to=${time}`;
        return axios({
            method: 'get',
            url: connectionString,
            headers: {
                'Authorization': `Bearer ${token}`,
                'content-type': 'Application/json'
            }
        });
    }
}