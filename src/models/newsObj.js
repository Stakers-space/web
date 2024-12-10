class News {
    constructor() {
        //this.id = null; - it's being added automatically
        this.partitionKey = "news";
        this.t = 0, // timestamp
        this.m = null, // message
        this.a = null; // link
        this.c = []; // category
    }
    SetTimestamp(timestamp){this.t = timestamp;}
    SetMessage(message){this.m = message;}
    SetLink(link){this.a = link;}
    SetCategory(category){this.c.push(category);}
}

module.exports = News;