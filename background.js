chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {
        file: "jquery.min.js"
    }, function() {
        // chrome extensions don't work on chrome extension pages, execute error alert
        if (chrome.runtime.lastError) {
            alert("Sorry! Web Doodle doesn't work on this page!");
        } else {
          chrome.tabs.executeScript(null, { file: "ourpopup.js" }, function() {})
        }
    });
});

// for html address
var id =100;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
        case "popup-click":
    // take screenshot when message is received by listener
    chrome.tabs.captureVisibleTab(function(screenshotUrl) {
      var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + id++)
      var targetId = null;

    chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
      // Wait for the tab to open, check that the tab's id matches the tab and that the tab finished loading.
      if (tabId != targetId || changedProps.status != "complete")
        return;

      // Do not need listener anymore so remove to avoid issues
      chrome.tabs.onUpdated.removeListener(listener);

      // Look through views to find screenshot window
      var views = chrome.extension.getViews();
      for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.location.href == viewTabUrl) {
          view.setScreenshotUrl(screenshotUrl);
          break;
        }
      }
    });

    chrome.tabs.create({url: viewTabUrl}, function(tab) {
      targetId = tab.id;
  });
});

// send empty response to sender
sendResponse({}); 
  break;
  default:
  // debug when message request and sender do not match
  alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
  }
});