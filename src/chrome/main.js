var def = "Plane";
var projection = def;
var plugins = [];

//inject poll.js to read _vr_native_ data
var s = document.createElement('script');
s.src = chrome.extension.getURL('poll.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};

// Listeners for events from poll.js (i.e. the background page)
// This is necessary because we can't access these globals directly from
// content scripts
document.addEventListener('pollData', function(e) {
    if (!window._vr_native_) {
        window._vr_native_ = {};
    }
    window._vr_native_.poll = function () {
        return e.detail.poll;
    }
    window._vr_native_.exec = function (id) {
        if (id == 1) {
            return e.detail.command1;
        } else if (id == 2) {
            document.dispatchEvent(new CustomEvent('resetHmd'));
        }
    }
});

// Change projection listener (from popup.js)
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
        if (!video.hasAttribute("data-vr-plugin-found")) {
            var icon = document.createElement("img"),
                plugin;
            icon.src = chrome.extension.getURL("icon16.png");
            icon.style["position"] = "absolute";
            icon.style.top = "5px";
            icon.style.right = "5px";
            icon.style.cursor = "pointer";
            icon.title = "Click to watch in 3D!";
            icon.addEventListener('click', function (evt) {
                this.style.display = "none";
                video.setAttribute("crossorigin", "anonymous");

                //will need to add logic to handle different sites here
                var contentEl = video.parentNode.children[0];
                var style = contentEl.style || {};
                var aspect = (style.width && style.height) ? (style.width.replace(/\D+/, "") / style.height.replace(/\D+/, "")) : (4/3);

                plugin = MAKE3D.init(video, {container: contentEl, projection: projection, aspectRatio: aspect });
                plugins.push(plugin);
                evt.stopPropagation();
            });
            video.setAttribute("data-vr-plugin-found", "true");
            (video.parentNode || document.body).appendChild(icon);
        }
    };
}

setInterval(checkVids, 3000);
