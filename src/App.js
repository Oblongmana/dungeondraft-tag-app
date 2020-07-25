import React from 'react';
import logo from './logo.svg';
import { Container, Box, Typography, Divider, Paper, Card, CardContent, Accordion, AccordionSummary } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert, AlertTitle } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import WarningIcon from '@material-ui/icons/Warning';
import SentimentSatisfiedIcon from '@material-ui/icons/SentimentSatisfied';
import isEmpty from 'lodash/isEmpty';

import FolderPicker from './components/FolderPicker/FolderPicker.js';
import FileListChooser from './components/FileListChooser/FileListChooser.js';
import TagPicker from './components/TagPicker/TagPicker.js';
import TagFilePreview from './components/TagFilePreview/TagFilePreview';
import TagData from './TagData';
import Logger from './Logger';

import './App.css';
import TagFilePicker from './components/TagFilePicker/TagFilePicker';

    // const useStyles = makeStyles((theme) => ({
    //     root: {
    //       width: '100%',
    //     },
    //     heading: {
    //       fontSize: theme.typography.pxToRem(15),
    //       flexBasis: '33.33%',
    //       flexShrink: 0,
    //     },
    //     secondaryHeading: {
    //       fontSize: theme.typography.pxToRem(15),
    //       color: theme.palette.text.secondary,
    //     },
    //   }))();
    // const classes = useStyles();

function isStringWithValue(theString) {
    return typeof theString === 'string' && !isEmpty(theString.trim())
}

class App extends React.Component {

    constructor(props) {
        super(props);

        //Check if Logging should be enabled
        Logger.ENABLE_LOGGING = process.env.REACT_APP_ENABLE_LOGGING === 'true';
        //Allow overriding the env setting with a url param
        let overrideLoggingSetting = new URLSearchParams(window.location.search).get('forceLogging');
        if (overrideLoggingSetting && (overrideLoggingSetting === 'true' || overrideLoggingSetting === 'false')) {
            Logger.ENABLE_LOGGING = Boolean(overrideLoggingSetting);
        }

        Logger.log('App:constructor');
        Logger.log('  -> Logger.ENABLE_LOGGING: ', Logger.ENABLE_LOGGING);

        this.state = {
            objectsDirFiles: [],
            tag: null,
            tagsFileContents: new TagData()
        };

        Logger.log('  -> this.state.tagsFileContents: ', this.state.tagsFileContents);

        this.handleObjectsDirChange = this.handleObjectsDirChange.bind(this);
        this.addNewTagAndSetCurrent = this.addNewTagAndSetCurrent.bind(this);
        this.associateFilesToCurrentTag = this.associateFilesToCurrentTag.bind(this);
        this.handleTagChange = this.handleTagChange.bind(this);
        this.handleInputTagsFileChange = this.handleInputTagsFileChange.bind(this);
    }

    handleObjectsDirChange(files) {
        Logger.log('App:handleObjectsDirChange');
        this.setState((state,props) => ({
            objectsDirFiles: [...files] //create a new array with our File objects
        }));
    }

    handleInputTagsFileChange(files) {
        Logger.log('App:handleInputTagsFileChange');
        if (!files.length) {
            return;
        }
        let file = files[0];
        let reader = new FileReader();
        var that = this;
        reader.onload = function(event) {
            Logger.log('  ->event.target.result', event.target.result);
            window.foo = event.target.result;
            Logger.log('  ->typeof event.target.result', typeof event.target.result);
            Logger.log('  ->JSON.parse(event.target.result', JSON.parse(event.target.result));

            const tagData = new TagData(JSON.parse(event.target.result));
            const initialTags = Object.keys(tagData.tags);
            let initialTag = initialTags.length > 0 ? initialTags[0] : null;
            that.setState((state,props) => ({
                tagsFileContents: tagData,
                tag: initialTag
            }));
        }
        reader.readAsText(file);
    }

    addNewTagAndSetCurrent(theNewTag) {
        Logger.log('App:addNewTagAndSetCurrent');
        let tempTagData = this.state.tagsFileContents.clone();
        tempTagData.addTag(theNewTag);
        this.setState((state,props) => ({
            tagsFileContents: tempTagData,
            tag: theNewTag
        }));
    }

    handleTagChange(theNewTag) {
        this.setState((state,props) => ({
            tag: theNewTag
        }));
    }

    associateFilesToCurrentTag(files) {
        Logger.log('App:this.associateFilesToCurrentTag');
        if (!isStringWithValue(this.state.tag)) {
            Logger.log('  -> No tag, returning early');
            return;
        }
        Logger.time('App:this.associateFilesToCurrentTag');
        let tempTagData = this.state.tagsFileContents.clone();
        tempTagData.setFilesForTag(this.state.tag, files);
        Logger.log('  -> about to update tags file. new data: ', tempTagData);
        this.setState((state,props) => ({
            tagsFileContents: tempTagData
        }));
        Logger.timeEnd('App:this.associateFilesToCurrentTag');
    }

    render () {
        let tagChooser;
        let tagFileChooser;
        let tagFilePreview;
        let tagList = Object.keys(this.state.tagsFileContents.tags);
        let canSelectFiles = isStringWithValue(this.state.tag);
        if (this.state.objectsDirFiles && this.state.objectsDirFiles.length > 0) {
            const alreadyChosenPaths = this.state.tagsFileContents.getPathListForTagWithoutPrefix(this.state.tag);
            tagChooser = <Card>
                <CardContent>
                    <Typography variant="h2">
                        Select Tag
                    </Typography>
                    <TagPicker
                        tag={this.state.tag}
                        onTagChange={this.handleTagChange}
                        tagList={tagList}
                        onNewTag={this.addNewTagAndSetCurrent}
                    />
                </CardContent>
            </Card>
            tagFileChooser = <Card>
                <CardContent>
                    <Typography variant="h2">
                        Tag/Untag Files
                    </Typography>
                    <FileListChooser
                        files={this.state.objectsDirFiles}
                        alreadyChosenPaths={alreadyChosenPaths}
                        onSelectionChange={this.associateFilesToCurrentTag}
                        canSelect={canSelectFiles}
                    />
                </CardContent>
            </Card>;
            tagFilePreview = <Card>
                <CardContent>
                    <Typography variant="h2">
                        File Preview
                    </Typography>
                    <TagFilePreview
                        contents={this.state.tagsFileContents}
                    />
                </CardContent>
            </Card>;
        }

        return (
            <Container maxWidth="xl">
                <Typography variant="h1" color="primary" >
                    Dungeondraft Tag App
                </Typography>

                <Divider />

                <Paper>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <WarningIcon color="primary" />
                            <Typography color="textPrimary" className={"App-accordion-header"}> Info</Typography>
                            <Typography color="textSecondary" align="center">Bugs, browser support, privacy, source code, and a how-to demo gif</Typography>
                        </AccordionSummary>
                        <Alert severity="warning">
                            Please note that this app is in beta - there are likely to be bugs. If you come across any, let me know at <a target="_blank" rel="noopener noreferrer" href="https://github.com/Oblongmana/dungeondraft-tag-app/issues">https://github.com/Oblongmana/dungeondraft-tag-app/issues</a>. (Really it was one-day hack to relearn React and start learning material-ui, as you can tell from the simplistic UI<SentimentSatisfiedIcon/>)
                        </Alert>
                        <Alert severity="warning">
                            Please note that this app uses functionality that is not supported by all browsers, though is supported by most modern desktop browsers. If you see this message - you're likely using a modern browser! If you run into any issues though, see the issue reporting link above.
                        </Alert>
                        <Alert severity="info">
                            Your files will remain private, and will not be uploaded to any servers, or in any way transmitted anywhere - but feel free to verify this yourself! Source code can be viewed at <a target="_blank" rel="noopener noreferrer" href="https://github.com/Oblongmana/dungeondraft-tag-app">https://github.com/Oblongmana/dungeondraft-tag-app</a>.
                        </Alert>
                        <Alert severity="info">
                            If you'd like to watch a basic how-to, one is available at <a target="_blank" rel="noopener noreferrer" href="https://github.com/Oblongmana/dungeondraft-tag-app#how-to-use">https://github.com/Oblongmana/dungeondraft-tag-app#how-to-use</a>. I recommend just having a go though - this app won't modify anything on your system, it just produces a downloadable tag file at the end.
                        </Alert>
                    </Accordion>
                </Paper>

                <Divider/>

                <Card>
                    <CardContent>
                        <Typography variant="h2">
                            Choose Existing Tag File (Optional)
                        </Typography>
                        <p style={{fontWeight: 'bold'}}>
                            Choose your existing tag file, or proceed without selecting one if you want to create a new one from scratch. You can return here if you change your mind, but note that if you do, loading a tag file will overwrite any selections you've already made.
                        </p>
                        <p style={{fontWeight: 'bold'}}>
                            Please note that the tag file will be reconciled with your selections, so if the tag file refers to objects that aren't in the directory you select, those will not be included in the output file
                        </p>
                        <Alert severity="warning">
                            The app does not handle Sets at present, but will not break any Sets already present in your tag file.
                        </Alert>
                        <p>
                            <TagFilePicker onChange={this.handleInputTagsFileChange}/>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h2">
                            Choose Folder
                        </Typography>
                        <p style={{fontWeight: 'bold'}}>Choose your objects folder (must be directly inside the "textures" folder)</p>
                        <p><FolderPicker onChange={this.handleObjectsDirChange}/></p>
                    </CardContent>
                </Card>

                {tagChooser}

                {tagFileChooser}

                {tagFilePreview}
            </Container>
            );
        }
    }

    export default App;
