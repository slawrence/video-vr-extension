var vids = document.getElementsByTagName('video');
var def = "Plane";
var projection = def;
var plugins = [];

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    projection = msg.projection || def;
    if (plugins.length) {
        plugins.forEach(function (p) {
            p.changeProjection(projection);
        });
    }
});

for (var i = 0; i < vids.length; i+=1) {
    var video = vids[i];
    var icon = document.createElement("img");
    icon.src = chrome.extension.getURL("icon16.png");
    icon.style["position"] = "absolute";
    icon.style.top = "5px";
    icon.style.right = "5px";
    icon.style.cursor = "pointer";
    icon.addEventListener('click', function (evt) {
        this.style.display = "none";
        //will need to add logic to handle different sites here
        var contentEl = video.offsetParent.firstChild;
        var style = contentEl.style || {};
        var aspect = (style.width && style.height) ? (style.width.replace(/\D+/, "") / style.height.replace(/\D+/, "")) : (4/3);
        plugin = MAKE3D.init(video, {container: contentEl, projection: projection, aspectRatio: aspect });
        plugins.push(plugin);
        evt.stopPropagation();
    });
    (video.offsetParent || document.body).appendChild(icon);
};
