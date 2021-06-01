import React, { useState,useEffect, useRef } from 'react'
import './Post.css';
import Avatar from "@material-ui/core/Avatar";
import {db } from './firebase';
import firebase from 'firebase';
import { Waypoint } from 'react-waypoint';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share'; 
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { IconButton } from '@material-ui/core';

function Post({ postId, user, username, caption, imageUrl,type }) {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [playing, setPlaying] = useState(false);
    const [like, setLike] = useState(false)
    const [likeCount, setLikeCount] = useState(0)

    const videoRef = useRef(null);

    // console.log(user)
    useEffect(()=>{
        let unsubscribe;
        
        if(postId){
            unsubscribe = db.collection("posts")
                .doc(postId)
                .collection("comments")
                .orderBy('timestamp','asc')
                .onSnapshot((snapshot)=>{
                    
                    setComments(snapshot.docs.map((doc)=>doc.data()));
                    
                });
        }
        return ()=>{
            unsubscribe();
        };
    }, [postId,user]);

    
    
    useEffect(()=>{
        let unsubscribe;
        
        if(postId){
            unsubscribe = db.collection("posts")
                .doc(postId)
                .collection("likes")
                .onSnapshot((snapshot) => {
                    // console.log(snapshot.size)
                    setLikeCount(snapshot.size)
                    snapshot.docs.map((doc) => {
                        if (doc.data().user === user?.displayName) {
                            setLike(true);
                        }
                    })
                    
                });
            
            
            }
        return ()=>{
            unsubscribe();
        };
    }, [postId,user]);

    const postComment = (event) =>{
        event.preventDefault();
        db.collection("posts").doc(postId).collection("comments").add({
            text: comment,
            username: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        setComment('');
    }
    
        const startVideo = () => {
        videoRef.current.pause();
        setPlaying(false);
    }

    const pauseVideo = () => {
        videoRef.current.play();
        setPlaying(true);
    }

     const handleVideoPress = () => {
        if (playing) {
        startVideo();
        } else {
        pauseVideo();
        }
    };
    
    const likeHandler = () => {
        console.log("LIKE HANDLER")
        let unsubscribe;

        if (!like) {
             unsubscribe = db.collection("posts").doc(postId).collection("likes").add({
            user: user?.displayName
        }).then(console.log("Liked")).catch((e)=>alert(e.message))
            setLike(true);
        }
        return ()=>{
            unsubscribe();
        };
    }
    const unlikeHandler = () => {
        console.log("UNLIKE HANDLER")
        let unsubscribe;
        
        if(like) {
            unsubscribe = db.collection("posts")
                .doc(postId)
                .collection("likes")
                .onSnapshot((snapshot) => {
                    snapshot.docs.map((doc) => {
                        if (doc.data().user === user?.displayName) {
                            db.collection("posts").doc(postId).collection("likes").doc(doc.id).delete()
                        }
                            
                    })
                })
            setLike(false)
        }
        return ()=>{
            unsubscribe();
        };
        
    }

    const likeNotLoginHandler = () => {
        alert("Sorry you need to login to Like The Post")
    }

    return (
        <div className="post">
            <div className="post__header">
                <Avatar
                    className="post__avatar"
                    alt={ username}
                    src="/static/images/avatar/1.jpg"
                    />
                
                <h3>{ username}</h3>
            </div>
            
            {
                
                (type?.split("/")[0] === 'video') ?
                    (
                        <Waypoint
                        onEnter={pauseVideo}
                        onLeave={startVideo}
                        >
                        <video
                            src={imageUrl}
                            className="post__video"
                            loop
                            // controls
                            onClick={handleVideoPress}
                            ref={videoRef}>   
                            </video>
                        </Waypoint>
                    ) :
                    // (type.split('/')[0] == 'video') ?
                        (
                            <img className="post__image" src={imageUrl} />
                        )
            }
            {/* image */}
            
            <div className="post__icons">

                <div className="post_iconLineOne">

                    {(like && user?.displayName) ?
                        (
                            <IconButton onClick={unlikeHandler}>
                                <FavoriteIcon style={{ color: "red" }} />
                                <p>{likeCount}</p>
                            </IconButton> 
                        ) : (
                            user? (
                                <IconButton  onClick={likeHandler}>
                                <FavoriteBorderIcon />
                                <p>{likeCount}</p>
                            </IconButton>
                        ) : (
                            <IconButton onClick={likeNotLoginHandler}>
                                <FavoriteBorderIcon />
                                <p>{likeCount}</p>
                            </IconButton>
                        )
                            
                        )
                    }
                    <IconButton>
                        <ShareIcon/>
                    </IconButton>
                    
                </div>
                <div>
                    <IconButton>
                         <MoreVertIcon/>
                    </IconButton>
                   
                </div>
                    
            </div>

            <h4 className="post__text"><strong>{ username}:</strong> {caption}</h4>


            <div className="post__comments" > 
                {comments.map((comment)=>(
                    <p>
                        <strong>{comment.username}: </strong>{comment.text}
                    </p>
                ))}

            </div>
            {user && (
                <form className="post__commentBox">
                <input
                    className="post__input"
                    type="text"
                    placeholder="Add comment..."
                    value={comment}
                    onChange={(e)=>setComment(e.target.value)}
                />
                <button
                className="post__button"
                disabled={!comment}
                type="submit"
                onClick={postComment}
                >
                Post
                </button>
            </form>
            )}
            
            
        </div>
    )
}

export default Post
