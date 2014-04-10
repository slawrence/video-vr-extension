var vids = document.getElementsByTagName('video');
var def = "Plane";
var projection = def;
var plugin;

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    projection = msg.projection || def;
    if (plugin) {
        plugin.changeProjection(projection);
    }
});

for (var i = 0; i < vids.length; i+=1) {
    var video = vids[i];
    var icon = document.createElement("img");
    icon.src = chrome.extension.getURL("icon.png");
    icon.style["position"] = "absolute";
    icon.style.top = "5px";
    icon.style.right = "5px";
    icon.style.cursor = "pointer";
    icon.addEventListener('click', function (evt) {
        var vid = document.getElementsByTagName('video')[0];
        this.style.display = "none";

        videojs(vid, {width: "100%", height: "100%"}, function() {
            var player = this;
            plugin = player.vr({projection: projection || "Plane"});
        });
        evt.stopPropagation();
    });
    (video.offsetParent || document.body).appendChild(icon);
};

