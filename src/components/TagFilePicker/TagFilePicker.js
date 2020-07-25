import React from 'react';
import PropTypes from 'prop-types';
import Logger from '../../Logger';
import './TagFilePicker.css';

function TagFilePicker(props) {
    function handleFileChange(event) {
        props.onChange(event.target.files);
    }

  return (
    <input id="myTagFileInput" type="file" onChange={handleFileChange}/>
  );
}

TagFilePicker.propTypes = {
    onChange: PropTypes.func.isRequired
}

export default TagFilePicker;
