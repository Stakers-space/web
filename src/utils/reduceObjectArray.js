function reduceObjectArray(obj, limit){
    let result = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {
            result[key] = obj[key].slice(limit);
        }
    }
    return result;
}

function keepDayCloseMarksOnly(objArr){

}

module.exports = {
    reduceObjectArray,
    keepDayCloseMarksOnly
};