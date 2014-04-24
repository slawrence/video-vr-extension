(function (global) {
    var projection = "Plane",
        plugins = [],
        iconUrl = "unknown.png",
        videojsUrl = "video-js/video.js",
        CHROME = !!global.chrome,//chrome global should exist if Chrome
        FIREFOX = !!self.port;//port global should exist if Chrome

    //TODO: Use actual browser detection?
    if (CHROME && FIREFOX) {
        console.error("uh oh - this should never happen");
        return;
    }

    //inject a file into the DOM
    function inject(url) {
        var s = document.createElement('script');
        s.src = url;
        (document.head||document.documentElement).appendChild(s);
        s.onload = function() {
            s.parentNode.removeChild(s);
        };
    }

    function injectCSS(url){
        var fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", url);
        
        if (fileref) {
            document.getElementsByTagName("head")[0].appendChild(fileref)
        }
    }

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

    // This is where the magic happens
    // Find all video elements and add the little red icon. Add a click
    // event handler to make it 3D
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
                    video.setAttribute("crossorigin", "anonymous");
                    video.className += "video-js vjs-default-skin";

                    //if width, height not found, set to "auto"
                    if (!video.getAttribute("width") && !video.getAttribute("height")) {
                        video.setAttribute("width", "auto");
                        video.setAttribute("height", "auto");
                    }

                    if (FIREFOX) {
                        video.src = video.src;
                        video.load();
                        video.play();
                    }

                    //will need to add logic to handle different sites here
                    var containerEl = video.parentNode;
                    var contentEl = containerEl.children[0];

                    contentEl.style.pointerEvents = "none";

                    plugin = global.MAKE3D.init(video, {projection: projection});
                    plugins.push(plugin);
                    evt.stopPropagation();
                });
                video.setAttribute("data-vr-plugin-found", "true");
                (video.parentNode || document.body).appendChild(icon);
            }
        };
    }

    //TODO: Place FIREFOX, CHROME code in separate scripts
    if (FIREFOX) {
        self.port.on("urls", function (obj) {
            inject(obj.pollJsUrl);
            iconUrl = obj.iconUrl;
            injectCSS(obj.cssUrl);
            setInterval(checkVids, 3000);
        });
    }

    if (CHROME) {
        //inject
        inject(chrome.extension.getURL('poll.js'));
        injectCSS(chrome.extension.getURL('video-js/video-js.css'));
        videojsUrl = chrome.extension.getURL('video-js/video.js');

        iconUrl = chrome.extension.getURL("icon16.png");

        // Change projection listener (from popup.js)
        chrome.runtime.onMessage.addListener(function (msg, sender, response) {
            projection = msg.projection || projection;
            if (plugins.length) {
                plugins.forEach(function (p) {
                    p.changeProjection(projection);
                });
            }
        });

        setInterval(checkVids, 3000);
    }

}(window));
