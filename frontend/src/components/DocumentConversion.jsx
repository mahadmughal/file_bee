import React, { useState, useEffect } from 'react';
import '../App.css'
import $ from 'jquery';

function DocumentConversion() {
    const [conversionData, setConversionData] = useState([])
    const [supportedConversions, setSupportedConversions] = useState({});

    useEffect(() => {
        // This code will run once when the component is mounted

        const fetchSupportedMimetypes = async () => {
            const url = 'http://localhost:8000/backend/target_conversions/';
            const headers = { 'Content-Type': 'application/json' };

            try {
                const response = await fetch(url, { method: 'GET', headers });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log(data);

                setSupportedConversions(data.supported_conversions);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        fetchSupportedMimetypes();

    }, []);

    const handleFileUpload = (event) => {
        const files = event.target.files;
        const fileObjects = [...files].map((file) => ({ file: file, status: 'ready' }));
        setConversionData([...conversionData, ...fileObjects]);
    };

    const selectSupportedConversion = (event) => {
        console.log('event: ', event);
        const conversionIndex = event.target.id;
        const selectedConversion = event.target.value;

        const newConversionData = [...conversionData];
        newConversionData[conversionIndex] = {
            ...newConversionData[conversionIndex],
            targetMimetype: selectedConversion
        };

        setConversionData(newConversionData);
    };

    const validateConversion = () => {
        const supportedConversionDropdowns = document.querySelectorAll('.target-mimetypes');
        let allDropdownsFilled = true;

        supportedConversionDropdowns.forEach(element => {
            if (element.value === '') {
                allDropdownsFilled = false;
                return; // Stop iterating if any dropdown is not filled
            }
        });

        if (!allDropdownsFilled) {
            alert('Please fill in all dropdowns before conversion.');
        }

        return allDropdownsFilled;
    };

    const handleConversionRequest = async (conversion, conversionIndex) => {
        const url = 'http://localhost:8000/backend/';
        const header = { 'X-CSRFTOKEN': getCookie('csrftoken') }
        const formData = new FormData();
        formData.append('original_file', conversion.file);
        formData.append('converted_mimetype', conversion.targetMimetype);

        try {
            const response = await fetch(url, { method: 'POST', header, body: formData });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.blob();
            const headers = response.headers;

            const blob = new Blob([data]);
            const contentType = headers.get('content-type').split('/').pop();
            console.log('content type: ', data);

            const fileDownloadUrl = URL.createObjectURL(blob);
            const convertedFileName = `converted_${conversionIndex}.${contentType}`;

            // console.log(`conversion_${conversionIndex}`, conversion);

            return { fileDownloadUrl: fileDownloadUrl, convertedFileName: convertedFileName };

        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    const handleConversion = async () => {

        const isValid = validateConversion();

        if (!isValid) {
            return;
        }

        const conversions = [...conversionData];

        try {
            await Promise.all(conversions.map(async (conversion, index) => {
                const { fileDownloadUrl, convertedFileName } = await handleConversionRequest(conversion, index);
    
                const updatedConversion = {
                    ...conversion,
                    fileDownloadUrl: fileDownloadUrl,
                    convertedFileName: convertedFileName
                }

                // Use the functional state update form
                setConversionData(prevConversions => {
                    const updatedConversions = [...prevConversions];
                    updatedConversions[index] = updatedConversion;
                    return updatedConversions;
                });
    
            }));
        } catch (error) {
            console.error('Error in one or more requests:', error);
        }
    };

    const handleCancelConversion = (index) => {
        const newConversionData = [...conversionData];
        newConversionData.splice(index, 1);
        setConversionData(newConversionData);
    }

    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    return (
        <div className="content">
            <div className="content content-full">
                <div className="d-flex flex-column justify-content-sm-between text-center">
                    <div className="flex-sm-fill font-size-h2 font-w400 text-center text-info">File Converter</div>
                    <div>Convert your files to any format</div>
                </div>
            </div>

            {conversionData.length > 0 &&
                <div className="block block-rounded block-bordered">
                    <div className="block-header block-header-default">
                        <h3 className="block-title">Document Conversions</h3>
                        <div className="block-options">
                            <div className="block-options-item">
                                {/* <code>.table</code> */}
                            </div>
                        </div>
                    </div>
                    <div className="block-content">
                        <table className="table table-vcenter">
                            <thead>
                                <tr>
                                    <th className="text-center">#</th>
                                    <th>Name</th>
                                    <th>Supported Conversions</th>
                                    <th className="d-none d-sm-table-cell">Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conversionData.map((fileObject, index) => (
                                    <tr key={index}>
                                        <td className="text-center" scope="row">{index + 1}</td>
                                        <td className="font-w600">
                                            <i className='fa fa-image mr-2'></i>
                                            {fileObject.file.name}
                                        </td>
                                        <td>
                                            <select className='form-control target-mimetypes' id={index} style={{ width: "70%" }} onChange={selectSupportedConversion}>
                                                <option value="" required>Convert to format     ...</option>
                                                {supportedConversions[fileObject.file.type]?.map((option, index) => (
                                                    <option key={index} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="d-none d-sm-table-cell">
                                            <span className="badge badge-primary">Ready</span>
                                        </td>
                                        <td className="text-center">
                                            <div className="btn-group">
                                                <button type="reset" className="btn btn-sm btn-danger mr-1" onClick={() => handleCancelConversion(index)}>
                                                    <i className="fa fa-fw fa-times"></i> Delete
                                                </button>
                                                { fileObject.fileDownloadUrl &&
                                                    <a href={fileObject.fileDownloadUrl ? fileObject.fileDownloadUrl : '#'} className="btn btn-sm btn-success" download={fileObject.convertedFileName ? fileObject.convertedFileName : ''}>
                                                        <i className="fa fa-fw fa-download"></i> Download
                                                    </a>
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="row block-content block-content-full block-content-sm bg-body-light">
                        <div className='col text-left'>
                            <label htmlFor="upload-files" className="btn btn-primary">
                                <i className="fa fa-plus mr-2"></i> Add more files
                            </label>
                            <input type="file" id="upload-files" onChange={handleFileUpload} multiple required hidden />
                        </div>
                        <div className='col text-right'>
                            <button type="reset" className="btn btn-danger mr-1" onClick={() => setConversionData([])}>
                                <i className="fa fa-repeat"></i> Delete All
                            </button>
                            <button type="submit" className="btn btn-primary" onClick={handleConversion}>
                                Convert All <i className="fa fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            }

            {conversionData.length === 0 &&
                <div className="block block-rounded block-bordered">
                    <div className="block-content">
                        <div id="upload-file" className="text-center">
                            <label htmlFor="id_original_file" className="btn btn-hero-primary mb-3">
                                <i className="fa fa-upload mr-1" aria-hidden="true"></i> Upload File
                            </label>
                            <input type="file" multiple name="original_file" required id="id_original_file" onChange={handleFileUpload} hidden />
                            <p>Upload your files here, 100MB maximum file size</p>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export default DocumentConversion;