const url = require('url'); 
const fs = require('fs');
var socks = require('socksv5');
var black_list = []; 
var blocked_stats = {} ;
let listen_port = 9080;
function loadBlackList() {  
    black_list = fs.readFileSync('./black_list')
    .toString('utf-8')
    .replace(/\r/g,'')
    .split('\n')         
    .filter(function(rx) { return rx.length })
    .map(function(rx) { return RegExp(rx) });
}
var srv = socks.createServer(function(info, accept, deny) {
    for(i in black_list){
        if (black_list[i].test(info.dstAddr)) {
            deny();
            if(blocked_stats[info.dstAddr] === undefined)
                blocked_stats[info.dstAddr] = 0;
            blocked_stats[info.dstAddr]++; 
            console.log("Access Denied : "+ info.dstAddr +  "\t#" + blocked_stats[info.dstAddr]);
            return;
        }
    }
    console.log("Accessing To : " + info.dstAddr);
    accept();
});
srv.listen(listen_port, 'localhost', function() {
    loadBlackList();
    console.log('SOCKS server listening on port ' + listen_port);
});

srv.useAuth(socks.auth.None());
