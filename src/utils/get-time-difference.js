const numeral = require('numeral');

function GetTimeDifferences(dataArr, format){
    const lastValue = dataArr[dataArr.length-1];
    return {
        day:   numeral(lastValue - dataArr[dataArr.length-2]).format(format),
        week:  numeral(lastValue - dataArr[dataArr.length-7]).format(format),
        month: numeral(lastValue - dataArr[dataArr.length-30]).format(format),
        year:  numeral(lastValue - dataArr[dataArr.length-365]).format(format),
    }
}
module.exports = GetTimeDifferences;