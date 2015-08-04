var gith = require('gith').create(9002); // run on port 9002
var exec = require('child_process').exec;
var busy = false;

gith({
    repo: 'spotsoftware/io-at-spot', // the github-user/repo-name
    file: /^raspberry/,
    branch: 'deploy'
}).on('all', function (payload) {

    console.log("new push on master branch and raspberry folder received");
    if (!busy) {
        busy = true;
        exec('./hook.sh', function (err, stdout, stderr) {
            if (err) {
                console.log('error', err);
                return err;
            }
            console.log(stdout);
            console.log("deploy terminated");
            busy = false;
        });
    }
});