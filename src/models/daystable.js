/*class DaysTable {
    constructor(){
        this.id = null;
        this.day = null;
        this.day_date = null,
        this.timestamp_start = null;
        this.timestamp_end = null;
        this.timestamp_validators = null;
    }
}*/

class Days {
    constructor() {
        //this.id = null;
        this.day = null;
        this.day_date = null,
        this.day_start = null;
        this.day_end = null;
    }

    GetFormatted(srcData){
        const arrLength = srcData.length;
        for (var d=0;d<arrLength;d++){
            const day = srcData[d];
            //console.log(day);
            this.day.push(day.day);
            this.apr.push(day.apr * 100);
            this.cl_apr.push(day.cl_apr * 100);
            this.el_apr.push(day.el_apr * 100);
            this.avgapr31d.push(day.avgapr31d * 100);
            this.day_start.push(day.day_start);
            this.day_end.push(day.day_end);
            this.total_rewards_wei.push(day.total_rewards_wei);
            this.cl_trprc.push((day.cl_apr / day.apr) *100); // share on rewards
            this.el_trprc.push((day.el_apr / day.apr) *100); // share on rewards
        }
        return this;
    };
}

module.exports = Days;