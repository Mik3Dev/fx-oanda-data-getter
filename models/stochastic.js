const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stochSchema = new Schema({
    instrument: {
        type: String,
        required: true,
    },
    timeframe: {
        type: String,
        
    }
})