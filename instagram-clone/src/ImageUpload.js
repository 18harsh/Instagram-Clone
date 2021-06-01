import { Button } from '@material-ui/core';
import React, { useState } from 'react';
import { storage, db } from './firebase';
import firebase from 'firebase';
import './ImageUpload.css'

function ImageUpload({username}) {

    const [image, setImage] = useState(null);
    
    // const [url, setUrl] = useState('');
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState('');

    const handleChange = (e) =>{
        if(e.target.files[0]){
            setImage(e.target.files[0])
        }
    }
    const handleUpload = () => {
        const uploadTask = storage.ref(`images/${image.name}`).put(image);
        
        
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // progress...
                
                if (snapshot.totalBytes >= 3000000) {
                    uploadTask.cancel();
                }
                const progress = Math.round(
                    (snapshot.bytesTransferred/snapshot.totalBytes)*100
                );

                setProgress(progress);
            },
            (error) => {
                if (error.code === 'storage/canceled') {
                    
                    alert(`File size exceeded 3MB`);
                } else {
                    alert(error.message);
                }
                console.log(error);
                
            },
            () => {
                storage
                    .ref("images")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        
                        db.collection("posts").add({
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            caption: caption,
                            imageURL: url,
                            username: username,
                            type: uploadTask._delegate._blob.type_,

                        });
                        setProgress(0);
                        setCaption("");
                        setImage(null);
                    })  
            }
        )
    }
    return (
        <div className="imageupload">
            <progress className="imageupload__progress" value={progress} max="100"/>
            <input type="text" placeholder="Enter a caption..." onChange={ e=>setCaption(e.target.value)}  value={caption}/>
            <input type="file" onChange={handleChange} />
            <Button onClick={handleUpload}>
                Upload
            </Button>
        </div>
    )
}

export default ImageUpload
