import React from 'react';
import PropTypes from 'prop-types';
import MaterialTable from 'material-table'
import isEqual from 'lodash/isEqual';
import Logger from '../../Logger';
import './FileListChooser.css';

class FileListChooser extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
        };
        this.cloneFileListToTableData = this.cloneFileListToTableData.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
    }

    componentDidMount() {
        Logger.log('FileListChooser:componentDidMount');
        Logger.log('  -> this.props.files',this.props.files);
        if (this.props.files) {
            Logger.log('  -> Files Supplied...Replacing Component State Data...');
            this.setState((state,props) => {
                return {
                    data: this.cloneFileListToTableData(props.files, props.alreadyChosenPaths, props.canSelect)
                };
            });
        }
    }

    componentDidUpdate(prevProps) {
        Logger.log('FileListChooser:componentDidUpdate');
        Logger.log('  -> prevProps', prevProps);
        Logger.log('  -> prevProps', prevProps);
        Logger.log('  -> this.props.files', this.props.files);
        if (prevProps.files !== this.props.files || !isEqual(prevProps.alreadyChosenPaths, this.props.alreadyChosenPaths) || prevProps.canSelect !== this.props.canSelect) {
            Logger.log('  -> Changing...Replacing Component State Data...');
            this.setState((state,props) => {
                return {
                    data: this.cloneFileListToTableData(props.files, props.alreadyChosenPaths, props.canSelect)
                };
            });
        }
    }

    /**
     * Given a FileList, will clone these into plain objects. Handles arrays fine too
     *
     * The table library used will mutate the data supplied to it, to track various things
     *  so it's necessary to take a deep copy instead of using props
     *
     * As a File is technically a Blob, cloning libraries struggle with it, so the simples
     * solution is just to copy what we want (which is just the info fields) ourselves,
     * and set the special var used for indicating selection in the table
     *
     * @param {FileList} files A FileList (or an Array of Files)
     * @param {Array[string]} alreadyChosenPaths An array of strings of paths that should be ticked
     * @param {boolean} canSelect whether we can select files or not
     */
    cloneFileListToTableData(files, alreadyChosenPaths, canSelect) {
        Logger.log('FileListChooser:this.cloneFileListToTableData');
        let filesArray = [...files]; //Can be an array-like FileList (cf. https://stackoverflow.com/questions/25333488)
        let tableData = filesArray.map((file, index) => ({
            name: file.name,
            webkitRelativePath: file.webkitRelativePath,
            type: file.type,
            lastModified: file.lastModified,
            size: file.size,
            index: index,
            tableData: {
                //Table library specific configuration
                checked: alreadyChosenPaths.includes(file.webkitRelativePath),
                disabled: !canSelect
            }
        }));
        Logger.log('  -> new tableData', tableData);
        return tableData;
    }

    handleSelectionChange(rows) {
        Logger.log('FileListChooser:handleSelectionChange');
        Logger.time('FileListChooser:handleSelectionChange');
        this.props.onSelectionChange(rows.map(row=>row.webkitRelativePath));
        Logger.timeEnd('FileListChooser:handleSelectionChange');
    }

    getImageForIndex(index) {
        return <img alt="Object" src={URL.createObjectURL(this.props.files[index])} style={{maxWidth: 120}} />;
    }


    render() {

        return (
            <MaterialTable
                title=""
                options={{
                    selection: true,
                    searchFieldAlignment: "left",
                    paging: false,
                    maxBodyHeight: 600,
                    selectionProps: (rowData)=>({disabled: rowData.tableData.disabled})
                }}
                onSelectionChange={this.handleSelectionChange}
                columns={[
                    { title: 'Name', field: 'name' },
                    { title: 'Location', field: 'webkitRelativePath' },
                    {
                        title: 'Image',
                        field: 'webkitRelativePath',
                        render: (rowData) => this.getImageForIndex(rowData.index)
                    }
                ]}
                data={this.state.data}
            />
        );
    }
}

FileListChooser.propTypes = {
    files: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        webkitRelativePath: PropTypes.number, // Used as the unique identifier for a given record
        type: PropTypes.string,
        selected: PropTypes.bool
    })).isRequired,
    //An array containing any paths that should already be ticked
    alreadyChosenPaths: PropTypes.arrayOf(PropTypes.string).isRequired,
    //will be called on any select/deselect, and contains an array of the webkitRelativePath of all Files that are currently selected. Anything NOT in the
    // array (but that was in your initial data set) is NOT selected.
    onSelectionChange: PropTypes.func.isRequired,
    //Whether the selection checkboxes are enabled. Defaults to true
    canSelect: PropTypes.bool
}

FileListChooser.defaultProps = {
    canSelect: true
}

export default FileListChooser;
