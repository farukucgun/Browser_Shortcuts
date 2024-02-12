import { printLine } from './modules/print';
// import bookmarkButtonImage from '../../assets/img/bookmark.png';

printLine('Hello from content script!');

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

// window.addEventListener('load', (event) => {
let youtubeLeftControls, youtubePlayer;
let currentVideo = "";
let currentVideoBookmarks = [];

// const fetchBookmarks = () => {
//   chrome.storage.sync.get([currentVideo], (result) => {
//     console.log("fetching bookmarks");
//     const bookmarks = result[currentVideo] ? JSON.parse(result[currentVideo]) : [];
//     console.log("bookmarks while fetching: ", bookmarks);
//     return bookmarks
//   });
// };

const fetchBookmarks = (callback) => {
  chrome.storage.sync.get([currentVideo], (obj) => {
    console.log("fetching bookmarks");
    const bookmarks = obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [];
    callback(bookmarks);
  });
};

const newVideoLoaded = async () => {
  console.log('New video loaded');
  const bookmarkBtnExists = document.getElementsByClassName("bookmark_btn").length > 0;

  if (!bookmarkBtnExists) {
    const bookmarkButton = document.createElement('img');
    bookmarkButton.src = chrome.runtime.getURL('bookmark.png');
    bookmarkButton.className = 'bookmark_btn' + ' ytp-button';
    bookmarkButton.title = 'Bookmark this moment';

    youtubeLeftControls = document.getElementsByClassName('ytp-left-controls')[0];
    if (!youtubeLeftControls) {
      console.log('Video controls not found');
      return;
    }
    youtubeLeftControls.appendChild(bookmarkButton);
    youtubePlayer = document.getElementsByClassName('video-stream')[0];

    bookmarkButton.addEventListener('click', () => {
      console.log('Bookmark button clicked');
      const currentTime = youtubePlayer.currentTime;

      const newBookmark = {
        time: currentTime,
        description: 'Bookmark at ' + getTime(currentTime)
      };

      fetchBookmarks((bookmarks) => {
            currentVideoBookmarks = bookmarks;
        
            chrome.storage.sync.set({
              [currentVideo]: JSON.stringify([...(currentVideoBookmarks || []), newBookmark].sort((a, b) => a.time - b.time))
            });
          });

      // currentVideoBookmarks = fetchBookmarks();

      chrome.storage.sync.set({ 
        [currentVideo]: JSON.stringify([...(currentVideoBookmarks || []), newBookmark].sort((a, b) => a.time - b.time))
      });
    });
  }

  fetchBookmarks((bookmarks) => {
    currentVideoBookmarks = bookmarks;
  });

  // currentVideoBookmarks = fetchBookmarks();
};

chrome.runtime.onMessage.addListener((request, sender, response) => {
  const { type, value, videoId } = request;
  console.log('Message received:', request);
  if (type === "NEW") {
    currentVideo = videoId;
    newVideoLoaded();
  } else if (type === "PLAY") {
    youtubePlayer.currentTime = value;
  } else if ( type === "DELETE") {
    currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
    chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });

    response(currentVideoBookmarks);
  }
});

newVideoLoaded();
// });

const getTime = (seconds) => {
  var date = new Date(0);
  date.setSeconds(seconds);

  return date.toISOString().substring(11, 19);
};



// let youtubeLeftControls, youtubePlayer;
// let currentVideo = "";
// let currentVideoBookmarks = [];

// const fetchBookmarks = (callback) => {
//   chrome.storage.sync.get([currentVideo], (obj) => {
//     const bookmarks = obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [];
//     callback(bookmarks);
//   });
// };

// const addNewBookmarkEventHandler = () => {
//   const currentTime = youtubePlayer.currentTime;
//   const newBookmark = {
//     time: currentTime,
//     desc: "Bookmark at " + getTime(currentTime),
//   };

//   fetchBookmarks((bookmarks) => {
//     currentVideoBookmarks = bookmarks;

//     chrome.storage.sync.set({
//       [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
//     });
//   });
// };

// const newVideoLoaded = () => {
//   const bookmarkBtnExists = document.querySelector(".bookmark-btn");

//   if (!bookmarkBtnExists) {
//     const bookmarkBtn = document.createElement("img");

//     bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
//     bookmarkBtn.className = "ytp-button bookmark-btn";
//     bookmarkBtn.title = "Click to bookmark current timestamp";

//     youtubeLeftControls = document.querySelector(".ytp-left-controls");
//     youtubePlayer = document.querySelector('.video-stream');

//     if (youtubeLeftControls) {
//       youtubeLeftControls.appendChild(bookmarkBtn);
//     }

//     bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
//   }

//   fetchBookmarks((bookmarks) => {
//     currentVideoBookmarks = bookmarks;
//   });
// };

// const handleMessage = (obj, sendResponse) => {
//   const { type, value, videoId } = obj;

//   if (type === "NEW") {
//     currentVideo = videoId;
//     newVideoLoaded();
//   } else if (type === "PLAY") {
//     youtubePlayer.currentTime = value;
//   } else if (type === "DELETE") {
//     fetchBookmarks((bookmarks) => {
//       currentVideoBookmarks = bookmarks.filter((b) => b.time != value);
//       chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
//       sendResponse({status: 'ok'}); // send back a response
//     });
//   }
// };

// // Here, chrome.runtime.onMessage is used to listen for messages sent from extension pages (e.g., popup or options page)
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   handleMessage(message, sendResponse);
//   return true;  // this will keep the message channel open until `sendResponse` is called
// });

// window.addEventListener('load', (event) => {
//   newVideoLoaded();
// });

// const getTime = t => {
//   var date = new Date(0);
//   date.setSeconds(t);
//   return date.toISOString().substr(11, 8);
// };