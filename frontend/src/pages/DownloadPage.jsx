// Authors: Derek Gary, Takaiya Jones

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import Layout from '../components/Layout';
import { handleDecryption } from '../components/CryptoOperations';
import {
    ready as sodiumReady,
    from_string,
    to_hex,
    from_hex,
    to_string,
    crypto_aead_xchacha20poly1305_ietf_decrypt,
} from '../../node_modules/libsodium-wrappers';

function DownloadPage() {
    const { mainId, subKey } = useParams();
    const [key, setKey] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [decryptedFileName, setDecryptedFileName] = useState(null);
    const [fileURL, setFileUrl] = useState(null);
    const [decryptedFileData, setDecryptedFileData] = useState(null);

    useEffect(() => {
        const hash = window.location.hash;
        const keyFromHash = hash.substring(1); // Removes the '#' at the start
        setKey(keyFromHash);

        const fetchData = async () => {
            setLoading(true);
            try {
                const fileResponse = await fetch(`https://api.test-server-0.click/api/file_process/${mainId}/${subKey}`);
                if (!fileResponse.ok) {
                      const error = fileResponse.status === 404 ? "Resource not found." : 'An error occurred while fetching the file.';
                      throw new Error(error);
                }

                const data = await fileResponse.json();
                setFileData(data);

                if (data.fileName) {
                    const result = await handleDecryption(subKey, data.fileName, null, keyFromHash);
                    if (result) {
                        setDecryptedFileName(result.fileName);
                        if (result.fileData !== null) {
                            setDecryptedFileData(result.fileData);
                        }
                    } else {
                        throw new Error("Decryption failed.");
                    }
                }

                const presignedResponse = await fetch(`https://api.test-server-0.click/api/generate_download_link/${mainId}/${subKey}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': Cookies.get('csrftoken')
                    },
                });

                if (!presignedResponse.ok) {
                    throw new Error('Failed to fetch presigned URL');
                }

                const presignedData = await presignedResponse.json();
                setFileUrl(presignedData.url);

                setLoading(false);
            } catch (err) {
                setErrorMessage(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [mainId, subKey]);

    const handleDownload = async () => {
        if (decryptedFileData && decryptedFileName) {
            const url = window.URL.createObjectURL(new Blob([decryptedFileData], { type: 'application/octet-stream' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', decryptedFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } else if (!decryptedFileData && fileURL && fileData) {
            try {
                const downloadResponse = await fetch(fileURL);
                const blob = await downloadResponse.blob();
                const result = await handleDecryption(subKey, fileData.fileName, blob, key);
                if (result && result.fileData) {
                    setDecryptedFileData(result.fileData);
                    const url = window.URL.createObjectURL(new Blob([result.fileData], { type: 'application/octet-stream' }));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', result.fileName);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } else {
                    throw new Error("Failed to decrypt file data.");
                }
            } catch (err) {
                setErrorMessage('Error downloading and decrypting file. Please try again.');
                console.error("Error downloading file:", err);
            }
        }
    };

    if (loading) {
        return (
            <Layout>
                <div classNameName="container">
                    <div classNameName="d-flex row align-items-center justify-content-center">
                        <div classNameName="col-auto d-flex justify-content-center flex-column pt-5">
                            <p classNameName="mt-5 pt-5 text-center display-6 text-primary">Loading...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (errorMessage) {
        return (
            <Layout>
                <div className="container">
                    <div className="d-flex row align-items-center justify-content-center">
                        <div className="col-auto d-flex justify-content-center flex-column pt-5">
                            <p className="mt-5 pt-5 text-center display-6 text-primary">{errorMessage}</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
    return (
        <Layout>
            <div class="container">
                <div class="row g-0 justify-content-center">
                    <div class="col-lg-6 bg-light card border-light rounded-4 mt-5">
                        <div class="card-body pt-3 px-3">
                            <div class="row py-2 d-flex">
                                <div class="col-6">
                                    <h4 class="fw-normal">Files</h4>
                                </div>
                                <div className="col-6 pe-0">
                                    <i className="icon fs-5 me-2 py-1 px-2 rounded rounded-pill fa-solid fa-gear float-end"></i>
                                </div>
                            </div>
                            <div className="row py-2 download border-bottom mb-4 d-flex" onClick={handleDownload}>
                                <div className="col-6">
                                    <div className="row">
                                        <h6 className="col-12 pb-0 mb-0 text-dark fw-bold">{decryptedFileName}</h6>
                                    </div>
                                    <div className="row mt-0">
                                        <h6 className="col-12 mt-0 text-secondary-emphasis fw-light">
                                            {fileData.fileSize < 1024 ? (
                                                <>
                                                    {Math.round(fileData.fileSize)} Bytes
                                                </>
                                            ) : fileData.fileSize < 1024 * 1024 ? (
                                                <>
                                                    {Math.round(fileData.fileSize / 1024)} KB
                                                </>
                                            ) : (
                                                <>
                                                    {(fileData.fileSize / (1024 * 1024)).toFixed(2)} MB
                                                </>
                                            )}
                                        </h6>
                                    </div>
                                </div>
                                <div className="col-6 pe-0">
                                    <i className="download-icon fs-5 me-2 py-1 px-2 fa-solid fa-download float-end"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row g-0 justify-content-center allotment-row">
                    <div className="col-lg-6 bg-light card mt-0 border-0 border-light rounded-0 bg-white">
                        <div className="card-body pt-3 px-3">
                            <div className="row py-2 d-flex">
                                <div className="allotment col-6">
                                    <div className="row">
                                        <p className="text-center fw-semibold mb-0 pb-0">
                                            Access Duration
                                        </p>
                                    </div>
                                    <div
                                        className="row border border-light bg-light rounded-pill px-2 pb-1 pt-2 d-flex justify-content-between align-items-center">
                                        <div className="col d-flex justify-content-between align-items-center">
                                            <div className="d-flex flex-column align-items-center">

                                                <h5 className="text-center mb-0 fw-normal text-secondary">9999</h5>
                                                <h6 className="time-format text-center mt-0 fw-normal">Days</h6>

                                            </div>
                                            <div className="d-flex align-items-center px-2">
                                                <h5 className="time-colon mb-0">:</h5>
                                            </div>
                                            <div className="d-flex flex-column align-items-center">

                                                <h5 className="text-center mb-0 fw-normal text-secondary">23</h5>
                                                <h6 className="time-format text-center mt-0 fw-normal">Hours</h6>

                                            </div>
                                            <div className="d-flex align-items-center px-2">
                                                <h5 className="time-colon mb-0">:</h5>
                                            </div>
                                            <div className="d-flex flex-column align-items-center">

                                                <h5 className="text-center mb-0 fw-normal text-secondary">59</h5>
                                                <h6 className="time-format text-center mt-0 fw-normal">Min.</h6>

                                            </div>
                                            <div className="d-flex align-items-center px-2">
                                                <h5 className="time-colon mb-0">:</h5>
                                            </div>
                                            <div className="d-flex flex-column align-items-center">

                                                <h5 className="text-center mb-0 fw-normal text-secondary">59</h5>
                                                <h6 className="time-format text-center mt-0 fw-normal">Sec.</h6>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="allotment col-3">
                                    <div className="row">
                                        <p className="text-center fw-semibold mb-0 pb-0">
                                            Transfers
                                        </p>
                                    </div>
                                    <div
                                        className="row border bg-light border-light rounded-pill mx-0 pb-2 pt-2 d-flex justify-content-center align-items-center">
                                        <div className="col text-center">
                                            <h5 className="mb-0 fw-normal text-secondary">9999</h5>
                                            <h6 className="time-format mt-0 fw-normal">Remaining</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="allotment col-3">
                                    <div className="row">
                                        <p className="text-center fw-semibold mb-0 pb-0">
                                            Share
                                        </p>
                                    </div>
                                    <div
                                        className="row border border-light bg-light rounded-pill mx-0 p-0 pb-2 pt-2 d-flex justify-content-center align-items-center share-icons">
                                        <div className="col-auto text-center">
                                            <i className="other-icon fs-5 rounded rounded-pill fa-solid fa-qrcode"></i>
                                        </div>
                                        <div className="col-auto text-center">
                                            <i className="other-icon fs-5 rounded rounded-pill fa-solid fa-link"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row py-2 d-flex">
                            <div className="allotment col-12">
                                <div
                                    className="dropdown row border border-0 bg-light rounded-pill mx-0 p-0 pb-2 pt-0 d-flex justify-content-center share-icons">
                                    <button className="btn btn-light border border-0 dropdown-toggle w-100 text-start" type="button"
                                        data-bs-toggle="dropdown" aria-expanded="false">
                                        Details
                                    </button>
                                    <ul className="dropdown-menu border border-0 mt-0 pt-0">
                                        <li>
                                            <div className="row dropdown-item mt-0 pt-0">
                                                <div className="row mt-0 pt-0">
                                                    <p className="mt-0 pt-2">ID</p>
                                                </div>
                                                <div className="row mt-0 pt-0">
                                                    <p>{mainId}</p>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="row dropdown-item pt-2 pb-0 border-top">
                                                <div className="row mt-0 pt-0 pb-0">
                                                    <p className="mt-0 pt-0 pb-0">Sub ID</p>
                                                </div>
                                                <div className="row mt-0 pt-0">
                                                    <p>{subKey}</p>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="row dropdown-item pt-2 pb-0 border-top">
                                                <div className="row mt-0 pt-0 pb-0">
                                                    <p className="mt-0 pt-0 pb-0">Encrypted File Name</p>
                                                </div>
                                                <div className="row key-text mt-0 pt-0 text-wrap">
                                                    <p>{fileData.fileName}</p>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="row dropdown-item pt-2 pb-0 border-top">
                                                <div className="row mt-0 pt-0 pb-0">
                                                    <p className="mt-0 pt-0 pb-0">Key</p>
                                                </div>
                                                <div className="row key-text mt-0 pt-0 text-wrap">
                                                    <p>{key}</p>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="row dropdown-item pt-2 pb-0 border-top">
                                                <div className="row mt-0 pt-0 pb-0">
                                                    <p className="mt-0 pt-0 pb-0">Created</p>
                                                </div>
                                                <div className="row mt-0 pt-0">
                                                    <p>{fileData.created}</p>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="row dropdown-item pt-2 pb-0 border-top">
                                                <div className="row mt-0 pt-0 pb-0">
                                                    <p className="mt-0 pt-0 pb-0">Valid Until</p>
                                                </div>
                                                <div className="row mt-0 pt-0">
                                                    <p>VALID UNTIL DATE GOES HERE</p>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="row dropdown-item pt-2 pb-0 border-top">
                                                <div className="row mt-0 pt-0 pb-0">
                                                    <p className="mt-0 pt-0 pb-0">Total File Size</p>
                                                </div>
                                                <div className="row mt-0 pt-0">
                                                    <p>
                                                        {fileData.fileSize < 1024 ? (
                                                            <>
                                                                {Math.round(fileData.fileSize)} Bytes
                                                            </>
                                                        ) : fileData.fileSize < 1024 * 1024 ? (
                                                            <>
                                                                {Math.round(fileData.fileSize / 1024).toFixed(2)} KB
                                                            </>
                                                        ) : (
                                                            <>
                                                                {(fileData.fileSize / (1024 * 1024)).toFixed(2)} MB
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="row dropdown-item pt-2 pb-0 border-top">
                                                <div className="row mt-0 pt-0 pb-0">
                                                    <p className="mt-0 pt-0 pb-0">Transfers</p>
                                                </div>
                                                <div className="row mt-0 pt-0">
                                                    <p>TOTAL NUMBER OF ALLOWABLE DOWNLOADS GOES HERE</p>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
export default DownloadPage;