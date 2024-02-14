import { printLine } from './modules/print';

printLine('Hello from content script!');

window.onload = () => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    const fetchBookmarks = (callback) => {
        chrome.runtime.sendMessage({ type: 'GET_BOOKMARKS', videoId: currentVideo }, (response) => {
            callback(response);
        });
    };

    const newVideoLoaded = async () => {
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

                chrome.runtime.sendMessage({ type: 'ADD_BOOKMARK', videoId: currentVideo, value: currentTime }, (response) => {
                    console.log('Bookmark added');
                });
            });
        }

        fetchBookmarks((bookmarks) => {
            currentVideoBookmarks = bookmarks;
        });
    }

    chrome.runtime.onMessage.addListener((request, sender, response) => {
        const { type, value, description, videoId } = request;

        if (type === "NEW_VIDEO") {
            currentVideo = videoId;
            newVideoLoaded();
        } 
        
        else if (type === "PLAY_BOOKMARK") {
            youtubePlayer.currentTime = value;
            youtubePlayer.play();
        } 
    });
  
    newVideoLoaded();
};