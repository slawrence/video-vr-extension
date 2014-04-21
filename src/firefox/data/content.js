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

(function (global) {
    var def = "Plane";
    var projection = def;
    var plugins = [];

    self.port.on("pollUrl", function (url) {
        var s = document.createElement('script');
        s.src = url;
        (document.head||document.documentElement).appendChild(s);
        s.onload = function() {
            s.parentNode.removeChild(s);
        };
    });

    var iconUrl = "unknown.png";
    self.port.on("sendIconUrl", function(url) {
        iconUrl = url;
        setInterval(checkVids, 3000);
    });
    checkVids();
    function checkVids () {
        var vids = document.getElementsByTagName('video');
        for (var i = 0; i < vids.length; i+=1) {
            var video = vids[i];
            if (!video.hasAttribute("data-vr-plugin-found")) {
                var icon = document.createElement("img"),
                    plugin;
                icon.src = iconUrl
                icon.style["position"] = "absolute";
                icon.style.top = "5px";
                icon.style.right = "5px";
                icon.style.cursor = "pointer";
                icon.title = "Click to watch in 3D!";
                icon.addEventListener('click', function (evt) {
                    this.style.display = "none";
                    video.crossOrigin="Anonymous";
                    video.src = video.src;
                    video.load();
                    video.play();

                    //will need to add logic to handle different sites here
                    var containerEl = video.parentNode;
                    var contentEl = containerEl.children[0];

                    //aspect ratio stuff
                    var aspect = (containerEl.offsetWidth && containerEl.offsetHeight) ? (containerEl.offsetWidth / containerEl.offsetHeight) : (4/3);
                    console.log('offsetWidth', containerEl.offsetWidth);
                    console.log('offsetHeight', containerEl.offsetHeight);
                    console.log('aspecccccccccccctt', aspect);

                    contentEl.style.pointerEvents = "none";

                    plugin = global.MAKE3D.init(video, {container: containerEl, projection: projection, aspectRatio: aspect });
                    plugins.push(plugin);
                    evt.stopPropagation();
                });
                video.setAttribute("data-vr-plugin-found", "true");
                (video.parentNode || document.body).appendChild(icon);
            }
        };
    }

}(window));
