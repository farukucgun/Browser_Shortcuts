console.log('Background script running');

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      checkCommandShortcuts();
    }
  });
  
  // Only use this function during the initial install phase. After
  // installation the user may have intentionally unassigned commands.
  function checkCommandShortcuts() {
    chrome.commands.getAll((commands) => {
      let missingShortcuts = [];
  
      for (let {name, shortcut} of commands) {
        if (shortcut === '') {
          missingShortcuts.push(name);
        }
      }

      if (missingShortcuts.length > 0) {
          // Update the extension UI to inform the user that one or more
          // commands are currently unassigned.
          console.log('The following commands are missing shortcuts:', missingShortcuts);
      }

      else {
          console.log('All commands have shortcuts assigned.');
      }
    });
  }

chrome.commands.onCommand.addListener((command) => {
    console.log(`Command "${command}" triggered`);
    switch (command) {
        case 'next-tab':
            chrome.tabs.query({currentWindow: true}, function(tabs) {
                let activeTab = tabs.find(tab => tab.active);
                let nextTab = tabs[(tabs.indexOf(activeTab) + 1) % tabs.length];
                chrome.tabs.update(nextTab.id, {active: true}); 
            });
            break;
        
        case 'previous-tab':
            chrome.tabs.query({currentWindow: true}, function(tabs) {
                let activeTab = tabs.find(tab => tab.active);
                let previousTab = tabs[(tabs.indexOf(activeTab) - 1 + tabs.length) % tabs.length];
                chrome.tabs.update(previousTab.id, {active: true}); 
            });
            break;
    }
});

chrome.tabs.onUpdated.addListener((tabId, tab) => {
    console.log("Tab updated: ", tabId, tab.url);
    if (tab.url && tab.url.includes("youtube.com/watch")) {
        const queryParameters = tab.url.split("?")[1];
        const urlParameters = new URLSearchParams(queryParameters);
        const videoId = urlParameters.get("v");
        console.log("sending message with type new");
        chrome.tabs.sendMessage(tabId, {type: "NEW", videoId});
    }
});

// const sendMessageToContentScript = (tabId, url) => {
//   if (url && url.includes("youtube.com/watch")) {
//     const queryParameters = url.split("?")[1];
//     const urlParameters = new URLSearchParams(queryParameters);

//     chrome.tabs.sendMessage(tabId, {
//       type: "NEW",
//       videoId: urlParameters.get("v"),
//     }, function(response) {
//       if (chrome.runtime.lastError) {
//         console.log(`Error: ${chrome.runtime.lastError.message}`);
//       } else {
//         console.log(`Received response: ${response}`);
//       }
//     });
//   }
// };

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete') {
//     sendMessageToContentScript(tabId, tab.url);
//   }
// });

// chrome.tabs.onActivated.addListener((activeInfo) => {
//   chrome.tabs.get(activeInfo.tabId, (tab) => {
//     sendMessageToContentScript(activeInfo.tabId, tab.url);
//   });
// });