class InstanceModel {
    constructor(owner, instanceName, instanceNote = null, instanceData = null, serverId = null, state = null, chain = null, fee_recipient = null, vi_sname = null, vi_suser = null, vi_sdata = null, vi_pid = null){
        this.owner = owner;
        this.instance = (instanceName !== '') ? instanceName : null;
        this.note = (instanceNote !== '') ? instanceNote : null;
        this.data = (instanceData !== '') ? instanceData : null;
        this.server_id = serverId;
        this.state = (state !== '') ? state : null;
        this.chain = chain;
        this.fee_recipient = (fee_recipient !== '') ? fee_recipient : null;
        this.vi_sname = (vi_sname !== '') ? vi_sname : null;
        this.vi_suser = (vi_suser !== '') ? vi_suser : null;
        this.vi_sdata = (vi_sdata !== '') ? vi_sdata : null;
        this.vi_pid = (vi_pid !== '') ? vi_pid : null;
    }

    GenerateFromMysqlResponse(mysqlObj){
        Object.entries(mysqlObj).forEach(([key, value]) => {
            this[key] = value;
        });
        return this;
    }
}

module.exports = InstanceModel;