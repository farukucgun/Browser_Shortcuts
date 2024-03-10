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

    else if (type === 'GET_ALL_BOOKMARKS') {
        chrome.storage.sync.get(null, (data) => {
            const allBookmarks = Object.keys(data).reduce((acc, key) => {
                if (Array.isArray(JSON.parse(data[key]))) {
                    acc[key] = JSON.parse(data[key]);
                }
                return acc;
            }, {});
            sendResponse(allBookmarks);
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
                time: parseFloat(value.toFixed(2)),
                description: 'Bookmark at: '
            };

            if (bookmarks.some((b) => b.time === newBookmark.time)) {
                return;
            }

            const updatedBookmarks = [...bookmarks, newBookmark].sort((a, b) => a.time - b.time);
            chrome.storage.sync.set({ [videoId]: JSON.stringify(updatedBookmarks) });
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'ADD_BOOKMARK', value: value });
            }
        });
    }

    else if (type === 'REMOVE_BOOKMARK') {
        chrome.storage.sync.get([videoId], (data) => {
            const bookmarks = data[videoId] ? JSON.parse(data[videoId]) : [];
            const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.time !== value);

            if (updatedBookmarks.length === 0) {
                chrome.storage.sync.remove(videoId);
            } else {
                chrome.storage.sync.set({ [videoId]: JSON.stringify(updatedBookmarks) });
            }

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'REMOVE_BOOKMARK', value: value });
                }
            });
        });
    }

    else if (type === 'REMOVE_VIDEO_BOOKMARKS') {
        chrome.storage.sync.remove(videoId);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'REMOVE_VIDEO_BOOKMARKS' });
            }
        });
    }

    else if (type === 'REMOVE_ALL_BOOKMARKS') {
        chrome.storage.sync.get(null, (data) => {
            Object.keys(data).forEach((key) => {
                if (Array.isArray(JSON.parse(data[key]))) { // careful, removes all the keys that are arrays
                    chrome.storage.sync.remove(key);
                }
            });
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'REMOVE_ALL_BOOKMARKS' });
            }
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

    else if (type === 'SET_NEW_TAB_OPTION') {
        chrome.storage.sync.set({ "newTabOption": value });
    }

    else if (type === 'GET_NEW_TAB_OPTION') {
        chrome.storage.sync.get('newTabOption', function (data) {
            const enableNewTabPage = data.newTabOption || false;
            sendResponse(enableNewTabPage);
        });
        return true;
    }

    else if (type === 'OPEN_SIDE_PANEL') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                // chrome.sidePanel.getOptions({ tabId: tabs[0].id }, (options) => {
                //     console.log('Options:', options);
                //     if (options.enabled) {
                //         chrome.sidePanel.setOptions({
                //             tabId: tabs[0].id,
                //             enabled: false,
                //         });
                //         chrome.sidePanel.close({ tabId: tabs[0].id });
                //     }

                //     else {
                        chrome.sidePanel.setOptions({
                            tabId: tabs[0].id,
                            path: 'panel.html',
                            enabled: true,
                        });
                        chrome.sidePanel.open({ tabId: tabs[0].id });
                //     }
                // });
            }
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

const newTabURL = "chrome://newtab/";

chrome.tabs.onCreated.addListener((tab) => {

    chrome.storage.sync.get('newTabOption', function (data) {
        const enableNewTabPage = data.newTabOption || false;
        const isNewTab = newTabURL === (tab.url || tab.pendingUrl);
        
        if (enableNewTabPage && isNewTab) {
            chrome.tabs.update(tab.id, { url: chrome.runtime.getURL('newtab.html') });
        }
    });
});

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({ url: newTabURL });
});