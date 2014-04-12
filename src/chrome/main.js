var def = "Plane";
var projection = def;
var plugins = [];

var s = document.createElement('script');
s.src = chrome.extension.getURL('poll.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};

// Event listener
document.addEventListener('pollData', function(e) {
    if (!window._vr_native_) {
        window._vr_native_ = {};
    }
    window._vr_native_.poll = function () {
        return e.detail;
    }
});
document.addEventListener('command1', function(e) {
    if (!window._vr_native_) {
        window._vr_native_ = {};
    }
    window._vr_native_.exec = function () {
        return e.detail;
    }
});

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    projection = msg.projection || def;
    if (plugins.length) {
        plugins.forEach(function (p) {
            p.changeProjection(projection);
        });
    }
});

function checkVids () {
    var vids = document.getElementsByTagName('video');
    for (var i = 0; i < vids.length; i+=1) {
        var video = vids[i];
        if (!video["data-vr-plugin-found"]) {
            var icon = document.createElement("img");
            icon.src = chrome.extension.getURL("icon16.png");
            icon.style["position"] = "absolute";
            icon.style.top = "5px";
            icon.style.right = "5px";
            icon.style.cursor = "pointer";
            icon.addEventListener('click', function (evt) {
                this.style.display = "none";

                //will need to add logic to handle different sites here
                var contentEl = video.offsetParent.children[0];
                var style = contentEl.style || {};
                var aspect = (style.width && style.height) ? (style.width.replace(/\D+/, "") / style.height.replace(/\D+/, "")) : (4/3);

                plugin = MAKE3D.init(video, {container: contentEl, projection: projection, aspectRatio: aspect });
                plugins.push(plugin);
                evt.stopPropagation();
            });
            video["data-vr-plugin-found"] = true;
            video.crossorigin="anonymous";
            (video.offsetParent || document.body).appendChild(icon);
        }
    };
}

setInterval(checkVids, 3000);
