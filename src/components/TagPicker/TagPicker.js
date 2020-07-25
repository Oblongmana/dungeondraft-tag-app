import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import Logger from '../../Logger';
import './TagPicker.css';

const filter = createFilterOptions();

class TagPicker extends React.Component {

    render() {
        return (
            <Autocomplete
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                id="TagPicker"
                value={this.props.tag}
                onChange={(event, newValue) => {
                    if (typeof newValue === 'string') {
                        this.props.onTagChange(newValue);
                    } else if (newValue && newValue.inputValue) {
                        //New tag process is now in flight
                        this.props.onNewTag(newValue.inputValue)
                    }
                }}
                options={this.props.tagList}
                renderOption={(option) => {
                    if (typeof option === 'string') {
                        return option;
                    } else {
                        //Account for the "Create New Tag" option
                        return option.title;
                    }
                }}
                filterOptions={(options, params) => {
                    const filtered = filter(options, params);

                    const matchingElem = options.find(element => element === params.inputValue);

                    // Suggest the creation of a new value - as an object to distinguish it from regular tags,
                    //   and to allow us to distinguish the tag value from the display value
                    if (params.inputValue !== '' && !matchingElem) {
                        filtered.push({
                            inputValue: params.inputValue,
                            title: `Create New Tag "${params.inputValue}"`,
                        });
                    }

                    return filtered;
                }}
                style={{ width: 300 }}
                renderInput={(params) => (
                    <TextField {...params} label="Choose/Create a tag" variant="outlined" />
                )}
            />
        );
    }
}

TagPicker.propTypes = {
    //The current tag
    tag: PropTypes.string.isRequired,
    //Called with the new active tag string, when the user changes the active tag
    onTagChange: PropTypes.func.isRequired,
    //An array of String tags
    tagList: PropTypes.arrayOf(PropTypes.string).isRequired,
    //Function will be invoked with a string if the user wants a new tag. The function should do whatever it needs to, but also add
    //  the value to the tagList prop.
    //  This component will then check if the tag is now present in tagList, and set the selected value to the requested new tag if it is
    onNewTag: PropTypes.func.isRequired
}

export default TagPicker;
