chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    console.log('messge received', msg);
    //projection = msg.projection || def;
});
