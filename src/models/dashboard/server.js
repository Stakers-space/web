class ServerModel {
    constructor(serverName, serverLocation = null, serverLocationNote = null, serverNetwork = null, serverCpu = null, serverUser = null, sshPort = null, operationStart = null,
                            vpnId = null, vpnExpiration = null, nodejs_ver = null, jdk_ver = null){
        this.serverName = serverName;
        this.serverOwner = null;
        this.serverLocation = ((serverLocation !== '') ? serverLocation : null);
        this.serverLocation_note = ((serverLocationNote !== '') ? serverLocationNote : null);
        this.serverNetwork = ((serverNetwork !== '') ? serverNetwork : null); // encrypted
        this.serverCpu = serverCpu; // encrypted
        this.serverUser = ((serverUser !== '') ? serverUser : null); // encrypted
        this.sshPort = ((sshPort !== '') ? sshPort : null); // encrypted
        this.operationStart = ((operationStart !== '') ? operationStart : null);
        this.vpnId = ((vpnId !== '') ? vpnId : null);
        this.vpnExpiration = ((vpnExpiration !== '') ? vpnExpiration : null);
        this.nodejsVer = ((nodejs_ver !== '') ? nodejs_ver : null);
        this.jdkVer = ((jdk_ver !== '') ? jdk_ver : null);
        this.execution = [];
        this.consensus = [];
        this.mev = [];
        this.instances = [];
        this.service = [];
    }

    AddClient(clientId, layer, clientStringId, clientver = null){
        if(!this[layer]) {
            console.error("Unknown layer", layer);
            return;
        }
        if(!clientId || !this.GetClientById(clientId)){ // add
            this[layer].push({ 
                id: ((clientId) ? clientId : null),
                client: clientStringId, 
                ver: ((clientver !== '') ? clientver : null), 
                ports: [] });
        }
        //return this[layer][this[layer].length -1];
    }

    AddClientPorts(layer, clientIndex, chain = 'N/A', serviceName = null, port = null, p2p_port = null, p2p_discovery_port = null, port_2 = null, data_path = null){
        if(!this[layer]) {
            console.error("Unknown layer");
            return;
        }
        if(clientIndex === -1) clientIndex = (this[layer].length - 1); // add to latest (there is only one client enabled currently)
       
        // verify port existence
        for(const port of this[layer][clientIndex].ports){
            if(port.service_name === serviceName) return;  
        }

        // service name as a clear port identificator
        this[layer][clientIndex].ports.push({
            chain: chain,
            service_name: ((serviceName === '') ? (chain+"-"+layer+"client") : serviceName),
            port: ((port !== '') ? port : null), // mysql escape
            p2p_port: ((p2p_port !== '') ? p2p_port : null), 
            p2p_discovery_port: ((p2p_discovery_port !== '') ? p2p_discovery_port : null), 
            port_2: ((port_2 !== '') ? port_2 : null),
            data_path: ((data_path !== '') ? data_path : null)
        });
        //return this[layer][clientIndex].ports[this[layer][clientIndex].ports.length -1];
    }

    AddInstance(instanceObj){
        for(const instance of this.instances){ // ignore repeated placement of an instance
            if(instance.instance_id === instanceObj.instance_id) return;
        }
        this.instances.push(instanceObj);
    }

    GetClientById(clientId){
        function iterate(layer) {
            let index = 0;
            for (let client of this[layer]) {
                if (client.id === clientId) {
                    client.arrLayer = layer;
                    client.arrIndex = index;
                    return client;
                }
                index++;
            }
            return null;
        }
    
        let client = iterate.call(this, "execution");
        if (client) return client;
        client = iterate.call(this, "consensus");
        if (client) return client;
        client = iterate.call(this, "service");
        if (client) return client;
    
        return null;
    }

    GenerateFromMySqlStructure(data){
        let baseDataDefined = false;
        for(const mark of data){
            if(!baseDataDefined){
                this.serverName = mark.name;
                this.serverOwner = mark.owner;
                this.serverLocation = mark.location;
                this.serverLocation_note = mark.location_note;
                this.serverNetwork = mark.ip_network;
                this.serverCpu = mark.cpu_type;
                this.serverUser = mark.server_user;
                this.sshPort = mark.ssh_port;
                this.operationStart = this.FormatDate(mark.operation_start);
                this.vpnId = mark.vpn_id;
                this.vpnExpiration = this.FormatDate(mark.vpn_expiration);
                this.nodejsVer = mark.nodejs_ver;
                this.jdkVer = mark.jdk_ver;
                baseDataDefined = true;
            }
            if(!mark.layer) continue;
            // 4 marks - 1x gnosis execution, 1x gnosis consensus, 1x ethereum execution, 1x ethereum consensus
            this.AddClient(mark.id, mark.layer, mark.client, mark.ver);
            this.AddClientPorts(mark.layer, -1, mark.chain, mark.service_name, mark.port, mark.port_p2p, mark.port_p2pd, mark.port_2, mark.data_path);
        }
        return this;
    }

    FormatDate(date){
        if(!date) return null;
        let d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    }

    ConvertServicesToObject(){
        this.service_obj = {};
        for(const srv of this.service){
            this.service_obj[srv.client] = srv;
        }
    }

    AddNote(note){
        this.serverNote = note;
    }

    GetDefinedChains(){
        let layers = ['execution','consensus'];
        this.chains = {};
        for(const layer of layers){
            for(const client of this[layer]){
                for (const port of client.ports){
                    if(port.chain) this.chains[port.chain] = "true";
                }
            }
        }
        return this.chains;
    }
    AggregatePortsbyChain(){
        let layers = ['execution','consensus'];
        this.portsByChain = {};
        for(const layer of layers){
            this.portsByChain[layer] = {
                "ethereum":[],
                "gnosis":[]
            }
            for(const client of this[layer]){
                
                for (const port of client.ports){
                    if(!this.portsByChain[layer][port.chain]) this.portsByChain[layer][port.chain] = [];
                    if(port.chain) this.portsByChain[layer][port.chain].push(port);
                }
            }
        }
    }

    CompareToNewValues(newData){
        //console.log("CompareToNewValues", this ,"vs", newData);
        let output = '';
        if(this.serverName !== newData.serverName) output += `<b>Server Name</b> ${this.serverName} &gt; ${newData.serverName} `;
        if(this.serverLocation !== newData.serverLocation) output += `<b>Server Location</b> ${this.serverLocation} &gt; ${newData.serverLocation} `;
        if(this.serverNetwork !== newData.serverNetwork) output += `<b>Server Network</b> ${this.serverNetwork} &gt; ${newData.serverNetwork} `;
        if(this.serverCpu !== newData.serverCpu) output += `<b>Server CPU</b> ${this.serverCpu} &gt; ${newData.serverCpu} `;
        if(this.serverUser !== newData.serverUser) output += `<b>Server User</b> ${this.serverUser} &gt; ${newData.serverUser} `;
        if(this.sshPort !== newData.sshPort) output += `<b>SSH port</b> ${this.sshPort} &gt; ${newData.sshPort} `;

        let that = this;
        processClientChangeLog("Execution");
        processClientChangeLog("Consensus");
        processClientChangeLog("Mev");

        function processClientChangeLog(layerName){
            const lk = layerName.toLowerCase();
            //console.log("processClientChangeLog", that[lk], newData[lk]);
            const ldc = that[lk].length;
            for(var i = 0; i < ldc; i++){
                const cd = that[lk][i];
                if(newData[lk].length === i){
                    output += `<b>${layerName} client ${cd.client}</b> removed `;
                    continue;
                }
                if(cd.client !== newData[lk][i].client) output += `<b>${cd.client}</b> &gt; ${newData[lk][i].client} `;
                if(cd.ver !== newData[lk][i].ver) output += `<b>${cd.client} version</b> ${cd.ver} &gt; ${newData[lk][i].ver} `;
                // process ports check
                const cdp = cd.ports,
                      ndp = newData[lk][i].ports;
                if(cdp.chain !== ndp.chain)  output += `<b>Chain</b> ${(cdp.chain) ? cdp.chain : "unset"} &gt; ${(ndp.chain) ? ndp.chain : "unset"} for client ${newData[lk][i].client}`;
                if(cdp.port !== ndp.port)  output += `<b>Port</b> ${(cdp.port) ? cdp.port : "unset"} &gt; ${(ndp.port) ? ndp.port : "unset"} `;
                if(cdp.p2p_port !== ndp.p2p_port)  output += `<b>P2P port</b> ${(cdp.p2p_port) ? cdp.p2p_port : "unset"} &gt; ${(ndp.p2p_port) ? ndp.p2p_port : "unset"} `;
                if(cdp.p2p_discovery_port !== ndp.p2p_discovery_port)  output += `<b>P2P Discovery port</b> ${(cdp.p2p_discovery_port) ? cdp.p2p_discovery_port : "unset"} &gt; ${(ndp.p2p_discovery_port) ? ndp.p2p_discovery_port : "unset"} `;
                if(cdp.port_2 !== ndp.port_2)  output += `<b>Port 2</b> ${(cdp.port_2) ? cdp.port_2 : "unset"} &gt; ${(ndp.port_2) ? ndp.port_2 : "unset"} `;
            }
            if(newData[lk].length > ldc) output += `<b>${layerName} client ${newData[lk][newData[lk].length -1].client}</b> added in version ${newData[lk][newData[lk].length -1].ver} `;
        }

        return output;
    }
}

module.exports = ServerModel;