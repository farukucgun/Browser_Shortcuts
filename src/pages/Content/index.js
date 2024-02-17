import { printLine } from './modules/print';
import { initializeYoutubeLogic } from './modules/youtube';
import './content.styles.css';

printLine('Hello from content script!');

window.onload = () => {
    initializeYoutubeLogic();
};