var gith = require('gith').create(9002);  // run on port 9002
var exec = require('child_process').exec;

gith({
    repo: 'spotsoftware/io-at-spot',  // the github-user/repo-name
    file: /^raspberry/,
    branch: 'deploy'
}).on('all', function(payload){

    console.log("new push on deploy branch and raspberry folder received");

    exec('config/hook.sh', function(err, stdout, stderr){
        if (err){
            return err;
        }
        console.log(stdout);
        console.log("deploy terminated");
    });
});
