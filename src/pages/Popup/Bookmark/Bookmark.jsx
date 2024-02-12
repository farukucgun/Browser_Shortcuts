import React from 'react';
import playImage from '../../../assets/img/play.png';
import deleteImage from '../../../assets/img/delete.png';

import '../Popup.css';

const Bookmark = ({bookmark, onDeleteBookmark}) => {
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
                    onClick={(e) => {
                        e.stopPropagation();
                        chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                            const tabId = tabs[0].id;
                            chrome.tabs.sendMessage(tabId, {type: 'PLAY', value: bookmark.time});
                        });
                    
                    }}
                />
                <img
                    src={deleteImage}
                    className='control_element'
                    onClick={(e) => {
                        e.stopPropagation();
                        chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                            const tabId = tabs[0].id;
                            chrome.tabs.sendMessage(tabId, {type: 'DELETE', value: bookmark.time});
                        });
                    }}
                />
            </div>
        </div>
    );
};

export default Bookmark;