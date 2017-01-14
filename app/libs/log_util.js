var fs = require('fs');
var log4js = require('log4js');
log4js.configure(__dirname + '/conf/logConf.json');
var clearLogs = function () {
    var folderExists = fs.existsSync('logs');
    if (folderExists) {
        var dirList = fs.readdirSync('logs');
        var len = dirList.length;
        dirList.forEach(function (fileName) {
            if(/log.log_.*/gi.test(fileName)) {
               if(len > 8) {
                   len --;
                   fs.unlinkSync('logs/' + fileName);
               }
            }
        });
    }
};
var interval = setInterval(function(){
    clearLogs();
}, 7200000);

var loggerConstructor = function (name) {
    name = name || "dateFileLog";
    var logger = log4js.getLogger(name);
    logger.setLevel('INFO');
    return logger;
};
exports.logger = loggerConstructor;