var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
pageMod.PageMod({
  include: "*.youtube.com",
  contentScriptFile: data.url("bundle.js"),
  //contentScriptFile: data.url("unmini-bundle.js"),
  contentScriptWhen: "end",
  onAttach: function(worker) {
    worker.port.emit("sendIconUrl", data.url("icon16.png"));
    worker.port.emit("pollUrl", data.url("poll.js"));
  }
});
