import { useNavigate } from 'react-router-dom';
import React from 'react';
import './Result.css'; // Import the separate CSS file
import { Link } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import ErrorOverlay from '../Shared/ErrorOverlay';
import LoadingSpinner from '../Shared/LoadingSpinner';
import useHttpClient from '../Shared/hooks/http-hook';
import { AuthContext } from '../Shared/context/auth-context';
import ScrollToBottom from 'react-scroll-to-bottom';


const Result = ({ changeHeader, topic }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const auth = useContext(AuthContext);
  const [loadedSession, setSession] = useState();
  const [error,setError]=useState(null);
  const { isLoading,  sendRequest, onCloseError } = useHttpClient();
  const [file, setFile] = useState();
  const [url, setUrl] = useState('');
  const[load,setLoad] = useState(false);

  const uploadImage = async (image) => {
    try {
      if (image === undefined) {
        setUrl(' ');
        return;
      }
      console.log(image.type);
      if (image.type == 'image/jpeg' ||
        image.type == 'image/png') {

        const data = new FormData();

        data.append("file", image);

        data.append('upload_preset', "cgb0zdwq");

        data.append("cloud_name", "dcrcc9b4h");
        const
          res = await fetch("https://api.cloudinary.com/v1_1/dcrcc9b4h/image/upload", {
            method: 'POST',
            body: data
          });
        const result = await res.json();
        console.log(result);
        console.log(result.secure_url);
        console.log(result.public_id);
        return {
          img:result.secure_url,
          id:result.public_id
        }
      }
    } catch (error) {
      console.log(error.message);
      return " ";
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL+'/session/topic/' + topic.substring(20));
        setSession(responseData);
      } catch (error) {

      }
    }
    fetchSession();
  }, [sendRequest]);

  const navigate = useNavigate();
  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files.length != 0) {
      const tempfile = event.target.files[0];;
      setFile(tempfile);
      setUploadedImage(URL.createObjectURL(tempfile));
    }
  };

  const joinSession = async (session) => {
    if(!auth.isLoggedIn){
      changeHeader('Learn It All');
      navigate('/');
    }
    const sessionID = session._id;

    
    
    try {
      const requestData = await sendRequest(
        process.env.REACT_APP_BACKEND_URL+'/session/' + sessionID,
        'PATCH',
        JSON.stringify({
          joining: true,
          newUserId: auth.userID,
        }),
        { 'Content-Type': 'application/json',
        Authorization:'Bearer ' +auth.token
      }
      );
      navigate('/Chatbox/' + session._id); // Pass session as a prop
    } catch (error) {
      setError("Session has closed");
    }
    finally {
    }
  };


  const handleRequestClick = async (session) => {
    // file && await uploadImage(file);
    
    //create a new Session(back-end) and set the session isRequesting parameter to true and 
    // sID would be the sessionID that was just created

    try {

      if (auth.isLoggedIn) {
        const formData = new FormData();
        console.log(topic.substring(20));
        setLoad(true);
        const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL+'/session', 'POST',
        JSON.stringify({
         topic:topic.substring(20),
          user: auth.userID,
          image: await uploadImage(file) ||{
            img:'',id:""
          }
        }),
        {
          'Content-Type': 'application/json' ,
          Authorization:'Bearer ' +auth.token
      }
        );

        const sID = responseData._id;
        setLoad(false);
        navigate('/chatbox/' + sID); // Pass session as a prop

      } else {
        changeHeader('Learn It All');
        navigate('/login');
      }
    } catch (error) {

    }

  }
  const handleAssistClick = () => {
    //view sessions -> get sessions from background whose isRequesting is true and topic matches
    changeHeader('Assist Someone with ' + topic.substring(20));
    navigate('/Assist');

  }

  const onClosedError = () => {
    setError(null);
};
  return (
    <React.Fragment>
     {error && (
        <ErrorOverlay error={error} onCloseError={onClosedError} />
      )}
      
      <div className='whole'>
        <div className='req'>

          <button className="reqbut" onClick={handleRequestClick}>

            <span >REQUEST</span>
          </button>
          <label className="reqbut" style={{ backgroundImage: `url(${uploadedImage})` }}>
            <span className='upload-text'>UPLOAD IMAGE</span>
            <input
              type="file"
              accept=".jpg,.png,.jpeg"
              onChange={handleImageUpload}
              style={{ display: "none" }} />

          </label>
          <button className="reqbut" onClick={handleAssistClick}>
            <span >ASSIST</span>
          </button>
        </div>
        <div>
          {/* this is temporary */}

        </div>
      
        {isLoading || load && <LoadingSpinner asOverlay />}
        <div className='result-container'>
          {!isLoading && loadedSession &&
            loadedSession.map((session) => (
              <div key={session.id} className='session-item'>
                <img src={session.image.img } alt={session.topic} className='session-image' />
                <h4 className='session-title'>{session.topic}</h4>
                <button
                  className='button-86'
                  onClick={() => joinSession(session)}
                  role='button'
                >
                  Join Session
                </button>
              </div>
            ))}
           
         
        </div>
      
      </div>
    </React.Fragment>
  );
};

export default Result;
