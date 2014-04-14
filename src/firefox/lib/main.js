var self = require("sdk/self");
var data = self.data;
var pageMod = require("sdk/page-mod");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");

pageMod.PageMod({
  include: "*.youtube.com",
  contentScriptFile: data.url("bundle.js"),
  //contentScriptFile: data.url("unmini-bundle.js"),
  contentScriptWhen: "end",
  onAttach: function(worker) {
    work = worker;
    worker.port.emit("sendIconUrl", data.url("icon16.png"));
    worker.port.emit("pollUrl", data.url("poll.js"));
  }
});

var button = buttons.ActionButton({
  id: "vr-plugin",
  label: "VR",
  icon: {
    "16": "./icon16.png",
    "32": "./icon32.png",
    "64": "./icon64.png"
  },
  onClick: handleClick
});

self.port.emit("myMessage", myMessagePayload);

function handleClick(state) {
}
