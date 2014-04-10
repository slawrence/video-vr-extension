window.addEventListener('load', function(evt) {
    var projKey = "projection";
    var messageDiv = document.getElementById('count');
    var select = document.getElementById('projection');

    function updateBasedOnCount(count) {
        if (count > 0) {
            messageDiv.innerText = count + " video element(s) found";
            select.disabled = false;
        } else {
            messageDiv.innerText = "No video elements found";
        }
    }

    function save() {
        var proj = select[select.selectedIndex].text;
        localStorage[projKey] = proj;
        updateMain(proj);
    }

    function updateMain(proj) {
        //send message to all tabs
        chrome.tabs.query({}, function(tabs) {
            var message = {projection: proj};
            for (var i=0; i<tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, message);
            }
        });
    }

    chrome.tabs.executeScript(null,
        { code:"document.body.getElementsByTagName('video').length" },
        updateBasedOnCount);

    select.addEventListener('change', function (evt) {
        save();
    });

    //Set select
    if (typeof localStorage[projKey] !== "undefined") {
        var projection = localStorage[projKey];
        for (var i = 0; i < select.length; i += 1) {
            if (select[i].text === projection) {
                select.selectedIndex = i;
                updateMain(projection);
                break;
            }
        }
    } else {
        save();
    }
});
