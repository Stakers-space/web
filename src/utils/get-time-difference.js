function GetTimeDifferences(dataArr, keyPath){
    let wDataArr = [];
    if(keyPath){
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
   // console.log(keyPath, "wDataArr:", wDataArr);

    const lastValue = wDataArr[dataArr.length-1];
    return {
        day:   lastValue - wDataArr[dataArr.length-2],
        week:  lastValue - wDataArr[dataArr.length-7],
        month: lastValue - wDataArr[dataArr.length-30],
        year:  lastValue - wDataArr[dataArr.length-365]
    }
}
module.exports = GetTimeDifferences;