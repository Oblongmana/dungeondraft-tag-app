import React from 'react';
import PropTypes from 'prop-types';
import Logger from '../../Logger';
import './FolderPicker.css';

function FolderPicker(props) {
    function handleFolderChange(event) {
        props.onChange(event.target.files);
    }

  return (
    <input id="myInput" type="file" webkitdirectory="true" directory="true" onChange={handleFolderChange}/>
  );
}

FolderPicker.propTypes = {
    onChange: PropTypes.func.isRequired
}

export default FolderPicker;
