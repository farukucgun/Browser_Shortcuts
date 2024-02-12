import React, { useState, useEffect } from 'react';
import Bookmark from './Bookmark/Bookmark';
import './Popup.css';

const Popup = () => {

  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (let key in changes) {
        if (key === currentVideo) {
          const newBookmarks = changes[key].newValue
            ? JSON.parse(changes[key].newValue)
            : [];
          setBookmarks(newBookmarks);
          console.log("Updated bookmarks: ", newBookmarks);
        }
      }
    });

    chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
      console.log("tab: ", tabs[0]);

      if (tabs[0].url) {
        const queryParameters = tabs[0].url.split("?")[1]; 
        const urlParameters = new URLSearchParams(queryParameters);
  
        const currentVideo = urlParameters.get("v");
  
        if (tabs[0].url.includes("youtube.com/watch") && currentVideo) {
          chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            setBookmarks(currentVideoBookmarks);
            console.log("bookmarks: ", bookmarks);
          });
        } else {
          setBookmarks([]);
        }
      }
    });

}, []);

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
            />
        ))}
      </div>
    </div>
  );
};

export default Popup;