import React, { useState, useEffect } from 'react';
import Bookmark from './Bookmark/Bookmark';
import SettingsImage from '../../assets/img/settings.png';
import './Popup.css';

/**
 * TODO:
 * Add keyboard shortcuts to add and navigate through bookmarks
 * work on options and new tab pages (allow disabling new tab page)
 * 
 * BUGS:
 */

const Popup = () => {

    const [bookmarks, setBookmarks] = useState([]);
    const [currentVideo, setCurrentVideo] = useState('');
    const [currentTab, setCurrentTab] = useState('');

    useEffect(() => {
        updateBookmarks();
    }, []);

    const updateBookmarks = async () => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            setCurrentTab(tabs[0].id);
            if (tabs[0].url && tabs[0].url.includes("youtube.com/watch")) {
                const queryParameters = tabs[0].url.split("?")[1];
                const urlParameters = new URLSearchParams(queryParameters);
                const currentVideo = urlParameters.get("v");

                if (currentVideo) {
                    setCurrentVideo(currentVideo);
                    chrome.runtime.sendMessage(currentTab, { type: 'GET_BOOKMARKS', videoId: currentVideo }, (response) => {
                        setBookmarks(response);
                    });
                }
            }
        });
    };

    const handleDeleteBookmark = async (time) => {
        const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.time !== time);
        setBookmarks(updatedBookmarks);

        await chrome.runtime.sendMessage({ type: 'DELETE_BOOKMARK', videoId: currentVideo, value: time });
    };

    const handleEditBookmark = async (time, newDescription) => {
        const updatedBookmarks = bookmarks.map(bookmark =>
            bookmark.time === time ? { ...bookmark, description: newDescription } : bookmark
        );
        setBookmarks(updatedBookmarks);

        await chrome.runtime.sendMessage({ type: 'EDIT_BOOKMARK', videoId: currentVideo, value: time, description: newDescription });
    };

    const handlePlayBookmark = async (time) => {
        await chrome.runtime.sendMessage({ type: 'PLAY_BOOKMARK', value: time });
    };

    const handleShareBookmark = async (time) => {
        const shavedTime = Math.floor(time);
        const url = `https://www.youtube.com/watch?v=${currentVideo}&t=${shavedTime}`;
        await navigator.clipboard.writeText(url);
    }

    return (
        <div className="app">
            <div className='title_container'>
                <h3 className='title'>Video Bookmarks</h3>
                <img 
                    src={SettingsImage}
                    className='control_element'
                    onClick={() => chrome.runtime.openOptionsPage()}
                />
            </div>
            <div className='bookmarks'>
                {bookmarks.length === 0 && <h3 className='no_bookmarks'>No bookmarks yet</h3>}
                {bookmarks.map((bookmark) => (
                    <Bookmark 
                        key={bookmark.time} 
                        bookmark={bookmark} 
                        onDeleteBookmark={handleDeleteBookmark}
                        onEditBookmark={handleEditBookmark}
                        onPlayBookmark={handlePlayBookmark}
                        onShareBookmark={handleShareBookmark}
                    />
                ))}
            </div>
        </div>
    );
};

export default Popup;