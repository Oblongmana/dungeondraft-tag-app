import uniq from 'lodash/uniq';
import pull from 'lodash/pull';
import toPairs from 'lodash/toPairs';
import sortBy from 'lodash/sortBy';
import fromPairs from 'lodash/fromPairs';
import clone from 'lodash/clone';
import Logger from './Logger';

/**
 * Get the path to a file
 * @param {File|string} file Either a File object or a string representing the path to a file
 */
function getPathString(file) {
    if (file instanceof File) {
        return file.webkitRelativePath;
    } else if (file instanceof String || typeof file === "string") {
        return file;
    } else {
        throw new Error('Expected either a File or string');
    }
}

class TagData {

    constructor(optExistingFileOrInstance,optExistingPrefix) {
        this.tags = {};
        this.sets = {};
        this.prefix = 'textures/'; //default, can be overriden (may properly hardcode in future though)

        if (optExistingFileOrInstance) {
            //Reconstruct. This will have the effect of correcting the following:
            // - missing array for a tag key
            // - unsorted tags
            // - unsorted tag files
            // - duplicate tag files
            // - duplicate tags (will merge them)
            // - making the prefix uniform - setting it to 'textures/'. Existing paths will otherwise be untouched
            for (const [tag,filePathArray] of Object.entries(optExistingFileOrInstance.tags)) {
                let uniformlyPrefixedFilePathArray = filePathArray.map(filePath=>{
                    let newFilePath = filePath;
                    if (!filePath.startsWith(this.prefix)) {
                        newFilePath = this.prefix + newFilePath;
                    }
                    return newFilePath;
                });
                this.setFilesForTag(tag,uniformlyPrefixedFilePathArray,true);
            }

            if (typeof optExistingFileOrInstance.sets === 'object') {
                this.sets = optExistingFileOrInstance.sets
            }
        }
    }

    clone() {
        return new TagData(this);
    }

    changeFilePrefix(newPrefix) {
        for (const [tag,filePathArray] of Object.entries(this.tags)) {
            this.tags[tag] = filePathArray.map(filePath=>{
                let newFilePath = filePath;
                if (filePath.startsWith(this.prefix)) {
                    newFilePath = filePath.replace(this.prefix,newPrefix);
                } else {
                    newFilePath = newPrefix + newFilePath;
                }
                return newFilePath;
            });
        }
        this.prefix = newPrefix;
    }

    toJSON() {
        //only include the tags and sets properties
        return {
            tags: this.tags,
            sets: this.sets
        }
    }


    getTagList() {
        return Object.keys(this.tags);
    }

    /**
     * Get a list of all paths for a tag, but without the prefix
     */
    getPathListForTagWithoutPrefix(theTag) {
        Logger.log('TagData:getPathListForTagWithoutPrefix');
        if (this.tagExists(theTag)) {
            let pathList = this.tags[theTag].map(path => {
                return path.startsWith(this.prefix) ? path.replace(this.prefix,'') : path;
            });
            Logger.log('  -> returning pathList', pathList);
            return pathList;
        }
        Logger.log('  -> Tag does not exist');
        return [];
    }

    /**
     * Check if the tag exists - NOTE: does not validate that it has an array - could be null, undefined, etc.
     *
     * Prefer addTag - it always ensures there's an array - even if the
     *
     * @param {string} theTag the tag
     */
    tagExists(theTag) {
        return theTag in this.tags;
    }

    /**
     * Add a new tag, if it doesn't exist already. If it does, also ensure that it has an array
     * @param {string} newTag the new tag to add
     */
    addTag(newTag) {
        Logger.log('TagData:addTag');
        Logger.log('  -> newTag', newTag);
        if (newTag in this.tags) {
            Logger.log('  -> Already exists, returning early...');
            if (!Array.isArray(this.tags[newTag])) {
                Logger.log('  -> Wasn\'t an array, setting to an empty array');
                this.tags[newTag] = [];
            }
            return;
        }
        //Keep the tag keys sorted, for human readability
        this.tags[newTag] = [];
        this.tags = fromPairs(sortBy(toPairs(this.tags)));
    }

    /**
     * Remove a tag - NOTE that this will completely remove all entries for the tag,
     * with no ability to restore them
     * @param {string} oldTag the old tag to remove
     */
    removeTag(oldTag) {
        delete this.tags[oldTag];
    }

    /**
     * Add file paths to a tag, maintaining uniqueness and sort order
     *
     * Will create the tag if it does not exist already.
     *
     * @param {string} tag the tag
     * @param {FileList|Array[File]} files the list of files
     */
    addFilesToTag(tag, files) {
        this.addTag(tag); //ensure the tag exists
        let filePathArray = this.tags[tag];
        files.forEach(file => {
            let newPathString = this.prefix + getPathString(file);
            //Uniqueness check
            if (!filePathArray.includes(newPathString)) {
                filePathArray.push(newPathString);
            }
        });
        filePathArray.sort();
        this.tags[tag] = filePathArray;
    }

    /**
     * Replace the existing list of files for a tag with a new list of files.
     *
     * Will create the tag if it does not exist already.
     *
     * @param {string} tag the tag
     * @param {FileList|Array[File]} files the list of files
     * @param {boolean} optSkipPrefixing optionally skip prefixing - should only be used when rehydrating using known data
     */
    setFilesForTag(tag, files, optSkipPrefixing) {
        Logger.time('TagData:setFilesForTag');
        this.addTag(tag); //ensure the tag exists
        let filePathArray = [];
        files.forEach(file => {
            filePathArray.push((optSkipPrefixing ? '' : this.prefix) + getPathString(file));
        });
        filePathArray = uniq(filePathArray); //ensure the supplied list doesn't have dups
        filePathArray.sort();
        this.tags[tag] = filePathArray;
        Logger.timeEnd('TagData:setFilesForTag');
    }

    /**
     * Remove file paths from a tag
     *
     * Will create the tag if it does not exist already.
     *
     * @param {string} tag the tag
     * @param {FileList|Array[File]} files the list of files
     */
    removeFilesFromTag(tag, files) {
        this.addTag(tag); //ensure the tag exists
        let filePathArray = this.tags[tag];
        let filePathsToRemove = [];
        files.forEach(file => {
            filePathsToRemove.push(this.prefix + getPathString(file));
        });
        pull(filePathArray,filePathsToRemove);
        filePathArray.sort(); //shouldn't be able to get unsorted here, but why not make sure
    }
}

export default TagData;