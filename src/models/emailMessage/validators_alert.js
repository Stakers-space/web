

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
		subject: "Offline validator detected",
		message: JSON.stringify(reportData)
	};
    return email;
};