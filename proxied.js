const request = require("request");
const fs = require("fs");

const proxies = fs.readFileSync("proxies.txt", "utf8").split(/\r?\n/);

var id = 0;

const target = process.argv.slice(2)[0];
const interval = process.argv.slice(2)[1];
const question = process.argv.slice(4).join(" ");
function log(msg) {
    console.log("[" + new Date().toLocaleString() + "] " + msg);
}
log(proxies.length + " proxies loaded.");

log("Starting on " + target + " with question " + question);

function sendMessage() {
    var boundary = "------WebKitFormBoundary303cfWjtOlIZ6yB7";
    var body = "";
    body = boundary + "\n" + "Content-Disposition: form-data; name=\"addressees\"\n\n" + id + "\n";
    body = body + boundary + "\n" + "Content-Disposition: form-data; name=\"anon\"\n\n" + "true" + "\n";
    body = body + boundary + "\n" + "Content-Disposition: form-data; name=\"question\"\n\n" + question + "\n";
    body = body + boundary + "--";
    request({
        url: "https://api.curiouscat.me/v2/post/create",
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundary303cfWjtOlIZ6yB7",
            "Cookie": "session_start: 151583000; session_vid: " + Math.random().toString() + ";",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3239.132 Safari/537.36"
        },
        proxy: "http://" + proxies[Math.floor(Math.random()*proxies.length)],
        body: body
    }, function(e, r, b) {
        if(e) return sendMessage();
        if(JSON.parse(b).hasOwnProperty("success") && JSON.parse(b).success === true) {
            log("Sent message with response code " + r.statusCode);
        }
        else {
            log("Failed to send message with response code " + r.statusCode + "(" + b + ")");
            process.exit(1);
        }
    });
}

log("Please wait, attempting to fetch data about the target...");
request({
    url: "https://api.curiouscat.me/v2/profile?count=0&username=" + target,
    method: "GET"
}, function(e, r, b) {
    if(e) {
        log("Failed to download data. " + e);
        process.exit(1);
    }
    var j = JSON.parse(b);
    id = j.id;
    log("Parsed user profile. ID: " + id);
    setInterval(function() {
        sendMessage();
    }, interval);
});