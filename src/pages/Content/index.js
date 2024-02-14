import { printLine } from './modules/print';

printLine('Hello from content script!');

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

window.onload = () => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  const fetchBookmarks = (callback) => {
    chrome.storage.sync.get([currentVideo], (obj) => {
      const bookmarks = obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [];
      callback(bookmarks);
    });
  };

  const newVideoLoaded = async () => {
    console.log('New video loaded');
    const bookmarkBtnExists = document.getElementsByClassName("bookmark_btn").length > 0;

    fetchBookmarks((bookmarks) => {
      currentVideoBookmarks = bookmarks;
    });

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
          description: 'Bookmark at: '
        };

        fetchBookmarks((bookmarks) => {
          currentVideoBookmarks = bookmarks;

          const bookmarkExists = currentVideoBookmarks.some((b) => b.time === newBookmark.time);
          if (bookmarkExists) {
            return;
          }
          
          chrome.storage.sync.set({ 
            [currentVideo]: JSON.stringify([...(currentVideoBookmarks || []), newBookmark].sort((a, b) => a.time - b.time))
          });
        });
      });
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, response) => {
    const { type, value, description, videoId } = request;
    console.log('Message received:', request);
    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      youtubePlayer.currentTime = value;
      youtubePlayer.play();
    } else if ( type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
    } else if (type === "EDIT") {
      const updatedBookmarks = bookmarks.map(bookmark =>
        bookmark.time === time ? { ...bookmark, description: description } : bookmark
      );
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(updatedBookmarks) });
    }
  });
  
  newVideoLoaded();
};