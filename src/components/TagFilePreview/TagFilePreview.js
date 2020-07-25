import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { Alert, AlertTitle } from '@material-ui/lab';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { saveAs } from 'file-saver';
import './TagFilePreview.css';
import { Box } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';

const darkgrey = grey[600];

class TagFilePreview extends React.Component {


    downloadTagFile(codeString) {
        var blob = new Blob([codeString], {type : 'text/text;charset=utf-8"'}); //really, it's a JSON file, but anything other than this causes rogue extensions to be added by browsers (which may happen anyway!)
        saveAs(blob, "default.dungeondraft_tags");
    }

    render() {
        const codeString = JSON.stringify(this.props.contents, null, '\t');
        return (
            <Box>
                <Alert severity="info">
                    Note when saving - some browsers and operating systems will automatically add an unwanted extension to the filename. If this happens, rename the file to "default.dungeondraft_tags"
                </Alert>
                <Button variant="contained" color="secondary" onClick={()=>{this.downloadTagFile(codeString)}}>
                    Download Tag File
                </Button>
                <SyntaxHighlighter language="javascript" style={monokaiSublime} customStyle={{height: 500}} showLineNumbers="true" showInlineLineNumbers="true" lineNumberStyle={{color: darkgrey}}>
                    {codeString}
                </SyntaxHighlighter>
            </Box>
        );
    }
}

TagFilePreview.propTypes = {
    contents: PropTypes.object.isRequired //should be of type TagData
}

export default TagFilePreview;
