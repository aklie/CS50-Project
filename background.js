browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {
        file: "jquery.min.js"
    }, function() {
        if (chrome.runtime.lastError) {
            alert("Page Draw doesn't support new tab pages or the Chrome Web Store because they are reserved by Chrome. Please try again on another page!");
        } else {
          chrome.tabs.executeScript(null, { file: "ourpopup.js" }, function() {})
        }
    });
});
