chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {urlContains: 'leetcode.com/problems/'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) { 
    console.log("request: ", request)
    console.log("sender: ", sender.url)
  });

// chrome.webNavigation.onCompleted.addListener(function() {

//   chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
//    function(tabs){
//       problemName = document.querySelector('div[data-cy="question-title"]');
//       console.log(problemName)
//       // chrome.storage.sync.set({url: `${problemName}`}, function() {
//       //   chrome.storage.sync.get(['url'], function(result) {
//       //     console.log(result)
//       //   })
//       // })
//    });


// }, {url: [{urlMatches : 'https://leetcode.com/problems/'}]});