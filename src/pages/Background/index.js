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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { type, videoId, value, description } = request;
    console.log('Message received:', request);

    if (type === 'GET_BOOKMARKS') {
        chrome.storage.sync.get([videoId], (data) => {
            const bookmarks = data[videoId] ? JSON.parse(data[videoId]) : [];
            sendResponse(bookmarks);
        });

        return true;
    }

    else if (type === 'PLAY_BOOKMARK') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, { type: 'PLAY_BOOKMARK', value: value }); // Propagate message to content script
            }
        });
    }

    else if (type === 'ADD_BOOKMARK') {
        chrome.storage.sync.get([videoId], (data) => {
            const bookmarks = data[videoId] ? JSON.parse(data[videoId]) : [];
            const newBookmark = {
                time: value,
                description: 'Bookmark at: '
            };

            if (bookmarks.some((b) => b.time === newBookmark.time)) {
                return;
            }

            const updatedBookmarks = [...bookmarks, newBookmark].sort((a, b) => a.time - b.time);
            chrome.storage.sync.set({ [videoId]: JSON.stringify(updatedBookmarks) });
        });
    }

    else if (type === 'DELETE_BOOKMARK') {
        chrome.storage.sync.get([videoId], (data) => {
            const bookmarks = data[videoId] ? JSON.parse(data[videoId]) : [];
            const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.time !== value);
            chrome.storage.sync.set({ [videoId]: JSON.stringify(updatedBookmarks) });
        });
    }

    else if (type === 'EDIT_BOOKMARK') {
        chrome.storage.sync.get([videoId], (data) => {
            const bookmarks = data[videoId] ? JSON.parse(data[videoId]) : [];
            const updatedBookmarks = bookmarks.map(bookmark =>
                bookmark.time === value ? { ...bookmark, description: description } : bookmark
            );
            chrome.storage.sync.set({ [videoId]: JSON.stringify(updatedBookmarks) });
        });
    }
});

const sendMessageToContentScript = (tabId, url) => {
  	if (url && url.includes("youtube.com/watch")) {
		const queryParameters = url.split("?")[1];
		const urlParameters = new URLSearchParams(queryParameters);

		chrome.tabs.sendMessage(tabId, { type: "NEW_VIDEO", videoId: urlParameters.get("v") }, (response) => {
			if (chrome.runtime.lastError) {
				console.log(`Error: ${chrome.runtime.lastError.message}`);
			} else {
				console.log(`Received response: ${response}`);
			}
		});
	}
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  	if (changeInfo.status === 'complete') {
    	sendMessageToContentScript(tabId, tab.url);
  	}
});

chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		sendMessageToContentScript(activeInfo.tabId, tab.url);
	});
});