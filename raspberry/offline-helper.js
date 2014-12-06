var storage = require('node-persist');

storage.initSync();

function storeMembers(members){
    storage.setItem('members', members);
}

function storeWorkingDays(workingDays){
    storage.setItem('workingDays', workingDays);
}

function saveData(uid){
    
    var workTimeEntriesToSync = storage.getItem('wte') || [];

    workTimeEntriesToSync.push({
        uid : uid,
        performedAt : new Date()
    });
    
    storage.setItem('wte', workTimeEntriesToSync);
}

function syncData(socket){
    var data = storage.getItem('wte');
    if(data && data !== []){
        socket.emit('offlineData',{ data : data },function(){
            storage.setItem('wte', []);
        });
    }
}

function isWorkingTime(){
    var now = new Date();
    var workingDays = storage.getItem('workingDays');

    var dayIndex = (now.getDay() - 1) >= 0 ? (now.getDay() - 1) : 6;
    
    var startTime = new Date(workingDays[dayIndex].startOfficeTime);
    startTime.setFullYear(now.getFullYear());
    startTime.setMonth(now.getMonth());
    startTime.setDate(now.getDate());  
    
    var endTime = new Date(workingDays[dayIndex].endOfficeTime);
    endTime.setFullYear(now.getFullYear());
    endTime.setMonth(now.getMonth());
    endTime.setDate(now.getDate());
    
    return (workingDays[dayIndex].active && 
        startTime <= now &&
        endTime >= now);
}


function authenticateMember(uid){
    var members = storage.getItem('members');
    
    if(members){
        for(var i=0; i < members.length; i++){
            if(members[i].nfc_uid === uid){
                saveData(uid);
                return true;
            }
        }
    }
    return false;
}


function authorizeAccess(uid){
    if(isWorkingTime()){
        if(authenticateMember(uid)){
            return true;
        }else {
            return false;
        }
    } else {
        return false;
    }
}

exports.syncData = syncData;
//exports.emptyOfflineData = emptyData;
exports.storeMembers = storeMembers;
exports.storeWorkingDays = storeWorkingDays;
//exports.isWorkingTime = isWorkingTime;
exports.authorizeAccess = authorizeAccess;