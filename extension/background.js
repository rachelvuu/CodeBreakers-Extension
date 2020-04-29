chrome.runtime.onInstalled.addListener(function() {
    let value = "on";
    chrome.storage.local.set({state: value});
  });