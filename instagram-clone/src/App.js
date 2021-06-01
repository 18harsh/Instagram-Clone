import React, { useEffect, useState } from 'react';
import './App.css';
import Post from './Post';
import { db, auth } from './firebase';
import Modal from '@material-ui/core/Modal';
import { Button, Input, makeStyles } from '@material-ui/core';
import ImageUpload from './ImageUpload';
import Avatar from "@material-ui/core/Avatar";
// import InstagramEmbed from 'react-instagram-embed';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {

  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);

  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser)=>{
    if (authUser) {
      //user has logged in... 
      
      setUser(authUser);
      // console.log(user)
      // console.log(user?.displayName);
      
    } else {
      // user has logged out...
      setUser(null);
    }
    })
    
    return () => {
      // perform clean up action
      unsubscribe();
    };
  }, [user, username]);

  useEffect(() => {
    db.collection('posts').orderBy('timestamp','desc').onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => (
        {
          id: doc.id,
          post: doc.data()
        }
      )))
    })
  },[])

  const signUp = (event) => {
    event.preventDefault();
    auth.createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username
        })
        
      })
      .catch((error) => alert(error.message))
    
    setOpen(false)
    setPassword("");
    setEmail("");
    setUsername("");
  }

  const signIn = (e) => {
    e.preventDefault();

    auth.signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message))
    
    setOpenSignIn(false);
    setUsername("");
    setPassword("");
    setEmail("");
  }

  return (
    <div className="app">
      
        
        <Modal
        open={open}
        onClose={()=> setOpen(false)}>
          <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
          <center>
              <img className="app__headerImage"
            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
              alt="" />
            </center>
            <Input
              placeholder="username"
              type="text"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
            />
            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
            <Input
              placeholder="password"
              type="text"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signUp}>
              sign Up
            </Button>
          
       
          </form>
          </div>
      </Modal>

      <Modal
        open={openSignIn}
        onClose={()=> setOpenSignIn(false)}>
          <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
          <center>
              <img className="app__headerImage"
            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
              alt="" />
            </center>
            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
            <Input
              placeholder="password"
              type="text"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signIn}>
              Sign In
            </Button>
          
       
          </form>
          </div>
      </Modal>

      <div className="app__header">
        <img className="app__headerImage"
        src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt="" />

          
          {
       user && (
         <Avatar
            className="post__header__avatar"
            alt={ user.displayName || "?"}
            src="/static/images/avatar/1.jpg"
        />  
        ) 
        }
        
         {
        user ? (
          <Button onClick={()=>auth.signOut()}>Logout</Button>
        ):
          (
            <div className="app__loginContainer">
              <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
              <Button onClick={() => setOpen(true)}>Sign Up</Button>
              
            </div> 
            
          )
      }
      </div>

      <div className="app__posts">
        <div className="app__postsLeft">
        {
        posts.map(({ id, post }) => (
          <Post key={id} postId={id} user={user} username={post.username} caption={post.caption} imageUrl={post.imageURL} type={post.type} />
        ))
        }
          </div>


        <div className="app_postsRight">
          {/* if you have clientAccessToken than use InstagramEmbed instead of dummy image*/}
            <img className="post__imageEmbed"
            src="https://beta.techcrunch.com/wp-content/uploads/2013/10/levis.png?w=417"
              alt="" />
            {/* <InstagramEmbed
                url='https://instagr.am/p/Zw9o4/'
                clientAccessToken='123|456'
                maxWidth={320}
                hideCaption={false}
                containerTagName='div'
                protocol=''
                injectScript
                onLoading={() => {}}
                onSuccess={() => {}}
                onAfterRender={() => {}}
                onFailure={() => {}}
              />*/}
        </div> 
        
      
      </div>
      
      <div className= "upload__div">
      
        {
        user?.displayName ? (
          <ImageUpload username={user.displayName} />  
        ) :
          (
            <h3>Sorry you need to login to upload</h3>
          )
        }
      </div>
      
      
      
    </div>
  );
}

export default App;
