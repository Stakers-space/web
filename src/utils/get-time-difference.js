function GetTimeDifferences(dataArr){
    const lastValue = dataArr[dataArr.length-1];
    return {
        day:   lastValue - dataArr[dataArr.length-2],
        week:  lastValue - dataArr[dataArr.length-7],
        month: lastValue - dataArr[dataArr.length-30],
        year:  lastValue - dataArr[dataArr.length-365]
    }
}
module.exports = GetTimeDifferences;