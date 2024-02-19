import React, { useEffect } from 'react';
import './Newtab.css';

const Newtab = () => {

    useEffect(() => {
        // chrome.storage.sync.get('enableNewTabPage', function (data) {
        // const enableNewTabPage = data.enableNewTabPage || false;
        // const enableNewTabPage = false;
        // if (!enableNewTabPage) {
        //     window.location.href = 'chrome://new-tab-page/'; // chrome://new-tab-page/, chrome://newtab/
        // }
        
        window.location.href = 'brave://new-tab-page/'; // brave://new-tab-page/, brave://newtab/

        // });
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <h1>This is a new tab</h1>
            </header>
        </div>
    );
};

export default Newtab;
