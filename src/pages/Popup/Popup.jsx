import React, { useState, useEffect } from 'react';
import Bookmark from './Bookmark/Bookmark';
import './Popup.css';

/**
 * TODO:
 * Add keyboard shortcuts to add and navigate through bookmarks
 * bookmark sharing 
 * 
 * BUGS:
 * some unrelated bookmarks get deleted when deleting a bookmark sometimes
 * above goes for the edit function as well
 * save bookmark button doesn't show up sometimes 
 */

const Popup = () => {

  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    updateBookmarks();

    // chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    //   if (changeInfo.status === 'complete') {
    //     updateBookmarks();
    //   }
    // });
  }, [bookmarks]);

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
    const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.time !== time);
    setBookmarks(updatedBookmarks);

    console.log("deleting the bookmark: ", time);
    console.log("bookmarks: ", updatedBookmarks);

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0 && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'DELETE', value: time } );
      }
    });
  };

  const handleEditBookmark = (time, newDescription) => {
    const updatedBookmarks = bookmarks.map(bookmark =>
        bookmark.time === time ? { ...bookmark, description: newDescription } : bookmark
    );
    setBookmarks(updatedBookmarks);

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0 && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'EDIT', value: time,  description: newDescription } );
      }
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
            onEditBookmark={handleEditBookmark}
            />
        ))}
      </div>
    </div>
  );
};

export default Popup;