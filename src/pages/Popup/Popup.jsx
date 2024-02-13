import React, { useState, useEffect } from 'react';
import Bookmark from './Bookmark/Bookmark';
import './Popup.css';

const Popup = () => {

  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    updateBookmarks();

    // Listen for changes to the current tab
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        updateBookmarks();
      }
    });
  }, []);

  const updateBookmarks = () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0].url && tabs[0].url.includes("youtube.com/watch")) {
        const queryParameters = tabs[0].url.split("?")[1];
        const urlParameters = new URLSearchParams(queryParameters);
        const currentVideo = urlParameters.get("v");

        if (currentVideo) {
          chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            setBookmarks(currentVideoBookmarks);
          });
        } else {
          setBookmarks([]);
        }
      }
    });
  };

  const handleDeleteBookmark = (time) => {
    // Filter out the bookmark to be deleted
    const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.time !== time);

    // Update Chrome storage with the updated bookmarks
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const currentTabId = tabs[0].id;
      chrome.tabs.sendMessage(currentTabId, { type: 'DELETE', value: time }, () => {
        // Update local state after deletion
        setBookmarks(updatedBookmarks);
      });
    });
  };

  return (
    <div className="app">
      <h3 className='title'>
        Your bookmarks for this video
      </h3>
      <div className='bookmarks'>
        {bookmarks.length === 0 && <h3 className='no_bookmarks'>No bookmarks yet</h3>}
        {bookmarks.map((bookmark) => (
          <Bookmark 
            key={bookmark.time} 
            bookmark={bookmark} 
            onDeleteBookmark={handleDeleteBookmark}
            />
        ))}
      </div>
    </div>
  );
};

export default Popup;