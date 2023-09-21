window.global = window;
import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { createFolder, uploadFile } from "../s3";

const lambdaURL =
    "https://v2bkovqgjcv2aaf7edroffsyu40ytgor.lambda-url.eu-north-1.on.aws/";

function App() {
    const [file, setFile] = useState(null);
    const [files, setFiles] = useState(null);
    const [filteredFiles, setFilteredFiles] = useState(null); // [file, file, file

    // TA IN SELECTED FOLDER
    // LOOPA GENOM ALLA FILES
    // KOLLA OM FOLDERNAMNET FINNS I FILENS NAMN
    // PUSHA IN I EN ARRAY

    const [folders, setFolders] = useState(null); // [folder, folder, folder
    const [newFolder, setNewFolder] = useState(null); // [folder, folder, folder
    const [hasLoaded, setHasLoaded] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState("");
    const [availableFolders, setAvailableFolders] = useState([]);

    const getFolderFiles = (folders) => {
        let filesLinks = [];
        let bucketURL =
            "https://aws-uppgift-war-kittens.s3.eu-north-1.amazonaws.com/";
        let filterdFiles = folders.filter(
            (file) => file.foldername === selectedFolder && file.object !== ""
        );
        filterdFiles.forEach((file) => {
            filesLinks.push(
                bucketURL +
                    (selectedFolder === "root" ? "" : selectedFolder + "/") +
                    file.object
            );
        });

        return filesLinks;
    };

    const fetchImages = async () => {
        const res = fetch(lambdaURL, {
            method: "GET",
        });
        const data = await (await res).json();

        console.log("DATA HERE", data);
        setFiles(await data);
        setHasLoaded(true);
    };

    const handleUpload = () => {
        // let urlFix = selectedFolder === "root" ? "" : selectedFolder + "/";
        uploadFile(file, selectedFolder === "root" ? "" : selectedFolder);
        setTimeout(() => {
            fetchImages();
        }, 300);
        // WHEN A FILE IS UPLOADED TO A NEW FOLDER, THE SELECT DROPDOWN SHOULD UPDATE WITH THE NEW FOLDER
    };

    useEffect(() => {
        console.log("SELECTED FOLDER ", selectedFolder);
    }, [selectedFolder]);

    const getFolders = (Contents) => {
        let results = [];

        Contents &&
            Contents.forEach((Object) => {
                const key = Object.Key; // Key: 'BEEEEEEEERAT/616dd86cc84e765750e205599d755d0c.jpg',
                const objectSplit = key.split("/"); //['BEEEEEEEERAT','616dd86cc84e765750e205599d755d0c.jpg']
                let folder = {};

                if (objectSplit.length < 2) {
                    folder = {
                        foldername: "root",
                        object: objectSplit[0],
                    };
                } else {
                    folder = {
                        foldername: objectSplit[0],
                        object: objectSplit[1],
                    };
                }

                if (objectSplit[0] !== "") {
                    results.push(folder);
                }
            });

        return results;
    };

    useEffect(() => {
        fetchImages(); // HÄMTAR ALLA BILDER
        console.log("FILES HERE", files);
        // SPARAR NER ALLA MAPPAR I FOLDERS
    }, []);

    useEffect(() => {
        if (files) {
            let foldersArray = getFolders(files.Contents);
            setFolders(foldersArray);
            console.log("FOLDERS STATE", folders);
        }
    }, [files]);

    useEffect(() => {
        if (folders) {
            let arr = [];

            folders.forEach((folder) => {
                if (!arr.includes(folder.foldername))
                    arr.push(folder.foldername);
            });

            setAvailableFolders(arr);
        }
        console.log("AVAILABLE FOLDER", availableFolders);
    }, [folders]);
    return (
        <div className="wrapper">
            <h1>Image upload AWS</h1>
            <section className="inputs">
                <label htmlFor="">
                    <input
                        type="file"
                        accept="image/*"
                        id="imageInput"
                        onChange={() => {
                            setFile(
                                document.getElementById("imageInput").files[0]
                            );
                        }}
                    />
                </label>
                <button onClick={handleUpload}>Upload</button>
                <input
                    type="text"
                    id="newFolderName"
                    onChange={(e) => setNewFolder(e.target.value)}
                />
                <button
                    onClick={(e) => {
                        createFolder(newFolder);
                        setAvailableFolders([...availableFolders, newFolder]);
                        document.getElementById("newFolderName").value = "";
                    }}
                >
                    ADD FOLDER
                </button>
            </section>
            <section className="dropdown">
                <select
                    value={selectedFolder}
                    name="dropdown"
                    id="dropdown"
                    onChange={(e) => {
                        setSelectedFolder(e.target.value);
                        // KALLA PÅ FILTER FUNKTIONEN
                    }}
                >
                    <option value="" default>
                        Choose folder
                    </option>
                    {hasLoaded &&
                        availableFolders &&
                        availableFolders.map((item, key) => {
                            return (
                                <option key={key} value={item}>
                                    {item}
                                </option>
                            );
                        })}
                </select>
            </section>
            <section className="imageList">
                <ul id="result">
                    {hasLoaded &&
                        folders &&
                        getFolderFiles(folders).map((file, key) => {
                            return <img key={key} src={file} />;
                        })}
                </ul>
            </section>
        </div>
    );
}

export default App;
