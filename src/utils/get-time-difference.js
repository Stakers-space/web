function GetTimeDifferences(dataArr, type, key){
    let wDataArr = [];
    if(type == "stateCount"){
        const keys = keyPath.split(".");
        for (const o of dataArr) {
            let value = o;
            for (const k of keys) {
                if (value == null) break;
                value = value[k];
            }
            wDataArr.push(value);
        }
    } else {
        wDataArr = dataArr;
    }
    const lastValue = wDataArr[dataArr.length-1];
    return {
        day:   lastValue - dataArr[dataArr.length-2],
        week:  lastValue - dataArr[dataArr.length-7],
        month: lastValue - dataArr[dataArr.length-30],
        year:  lastValue - dataArr[dataArr.length-365]
    }
    
}
module.exports = GetTimeDifferences;