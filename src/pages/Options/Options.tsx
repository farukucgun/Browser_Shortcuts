import React, { useState, useEffect } from 'react';
import './Options.css';

interface Props {
    title: string;
}

const Options: React.FC<Props> = ({ title }: Props) => {

    const [newTabEnabled, setNewTabEnabled] = useState<boolean>(false);

    const handleDropDownChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewTabEnabled(e.target.value === 'true');

        await chrome.runtime.sendMessage({ type: 'NEW_TAB_OPTION', value: e.target.value === 'true' });
    }

    useEffect(() => {
        chrome.storage.sync.get('newTabOption', (data) => {
            setNewTabEnabled(data && data.newTabOption ? data.newTabOption : false);
        });
    }, []);
    

    return (
        <div className="OptionsContainer">
            <h1>{title} Page</h1>
            <div className="OptionsContent">
                <label htmlFor="newTabEnabled">Enable Custom New Tab: </label>
                <select name="newTabEnabled" id="newTabEnabled" onChange={handleDropDownChange} value={newTabEnabled.toString()}>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                </select>
            </div>
        </div>
    );
};

export default Options;
