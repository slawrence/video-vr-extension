var self = require("sdk/self");
var data = self.data;
var pageMod = require("sdk/page-mod");

//fonts do not work because font folder is not accessible in firefox
//https://bugzilla.mozilla.org/show_bug.cgi?id=792479

pageMod.PageMod({
  include: "*",
  contentScriptFile: data.url("bundle.js"),
  contentScriptWhen: "end",
  onAttach: function(worker) {
    worker.port.emit("urls", {
       iconUrl: data.url("icon16.png"),
       pollJsUrl: data.url("poll.js"),
       cssUrl: data.url("video-js/video-js.css")
    });
  }
});
