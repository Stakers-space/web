

exports.OnlineAlert = function(reportData){
    console.log("Email model | OnlineAlert |",reportData);
    var email = {
		subject: "Validators is back online",
		message: JSON.stringify(reportData)
	};
    return email;
};
exports.OfflineAlert = function(reportData){
    console.log("Email model | OfflineAlert |",reportData);
    var email = {
		subject: "Offline validator(s) detected | StakersSpace Monitor",
		message: JSON.stringify(reportData)
	};
    return email;
};
exports.ServerAuthentization = function(reportData){
    console.log("Email model | ServerAuthentization |",reportData);
    var email = {
		subject: `Authentization ${reportData.l} on server id ${reportData.s}`,
		message: `Someone reied log in to server id ${reportData.s} with status ${reportData.l}`
	};
    return email;
};