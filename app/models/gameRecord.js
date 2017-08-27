/**
 * Created by Administrator on 2016/7/14.
 */
var mongoose = require('mongoose');

module.exports = mongoose.model('GameRecord', {
    date:Date
    ,game: Number
    ,name: String
    ,role: String
    ,lover: Number
    ,dying: String
    ,deathday:Number
    ,lucky:String
    ,win: Number
    ,see:Number
    ,badge: String
    ,season: Number
    ,extra_score:Number
});