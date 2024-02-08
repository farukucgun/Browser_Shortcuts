console.log('This is the background page.');
console.log('Put the background scripts here.');

/* 
    Listen for ctrl + right arrow key press to switch to the tab on the right
    Listen for ctrl + left arrow key press to switch to the tab on the left
    Listen for ctrl + shift + right arrow key press to move the tab to the right
    Listen for ctrl + shift + left arrow key press to move the tab to the left
    Listen for ctrl + shift + up arrow key press to move the tab to the first position
    Listen for ctrl + shift + down arrow key press to move the tab to the last position
    Listen for ctrl + shift + delete key press to close the tab
    Listen for ctrl + shift + enter key press to open a new tab
    Listen for ctrl + shift + t key press to reopen the last closed tab
    Listen for ctrl + shift + r key press to reload the tab
*/

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

        case 'close-tab':
            chrome.tabs.query({currentWindow: true}, function(tabs) {
                let activeTab = tabs.find(tab => tab.active);
                chrome.tabs.remove(activeTab.id);
            });
            break;
    }
});

// chrome.commands.onCommand.addListener(function(command) {
//     if (command === 'next-tab') {
//         chrome.tabs.query({currentWindow: true}, function(tabs) {
//             let activeTab = tabs.find(tab => tab.active);
//             let nextTab = tabs[(tabs.indexOf(activeTab) + 1) % tabs.length];
//             chrome.tabs.update(nextTab.id, {active: true}); 
//         });
//     }
// });
    