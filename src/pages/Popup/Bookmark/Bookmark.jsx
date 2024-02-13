import React from 'react';
import playImage from '../../../assets/img/play.png';
import deleteImage from '../../../assets/img/delete.png';

import '../Popup.css';

const Bookmark = ({bookmark, onDeleteBookmark}) => {

    const handleDeleteBookmark = (e) => {
        e.stopPropagation();
        onDeleteBookmark(bookmark.time);
    }

    const handlePlayBookmark = (e) => {
        e.stopPropagation();
        chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
            const tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, {type: 'PLAY', value: bookmark.time});
        });
    }

    return (
        <div
            id={'bookmark-' + bookmark.time}
            className='bookmark'
        >
            <h3 className='bookmark_description'>{bookmark.description}</h3>
            {/* <p className='bookmark_time'>{bookmark.time}</p> */}
            <div className='control_elements'>
                <img
                    src={playImage}
                    className='control_element'
                    onClick={handlePlayBookmark}
                />
                <img
                    src={deleteImage}
                    className='control_element'
                    onClick={handleDeleteBookmark}
                />
            </div>
        </div>
    );
};

export default Bookmark;