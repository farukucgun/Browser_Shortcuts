import React, { useState } from 'react';
import playImage from '../../../assets/img/play.png';
import deleteImage from '../../../assets/img/delete.png';
import shareImage from '../../../assets/img/share.png';

import '../Popup.css';

const Bookmark = ({bookmark, onDeleteBookmark, onEditBookmark, onPlayBookmark, onShareBookmark}) => {

    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(bookmark.description);

    const handleDeleteBookmark = (e) => {
        e.stopPropagation();
        onDeleteBookmark(bookmark.time);
    }

    const handlePlayBookmark = (e) => {
        e.stopPropagation();
        onPlayBookmark(bookmark.time);
    }

    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        setIsEditing(false);
        onEditBookmark(bookmark.time, description);
    };

    const handleShareBookmark = (e) => {
        e.stopPropagation();
        onShareBookmark(bookmark.time);
    }

    const getTime = (seconds) => {
        let date = new Date(0);
        date.setSeconds(seconds);
      
        return date.toISOString().substring(11, 19);
    };

    return (
        <div
            id={'bookmark-' + bookmark.time}
            className='bookmark'
        >
            {isEditing ? (
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleSaveEdit}
                    autoFocus
                />
            ) : (
                <h3 className='bookmark_description' onClick={handleEditClick}>
                    {bookmark.description}
                </h3>
            )}
            <h3 className='bookmark_time'>{getTime(bookmark.time)}</h3>
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
                <img
                    src={shareImage}
                    className='control_element'
                    onClick={handleShareBookmark}
                />
            </div>
        </div>
    );
};

export default Bookmark;