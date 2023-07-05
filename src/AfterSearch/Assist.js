import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../Shared/LoadingSpinner';
import ScrollToBottom from 'react-scroll-to-bottom';
import ErrorOverlay from '../Shared/ErrorOverlay';
import useHttpClient from '../Shared/hooks/http-hook';
import { AuthContext } from '../Shared/context/auth-context';


const Assist = ({ changeHeader, topic }) => {
  const [loadedSession, setSession] = useState();
  const [error,setError]=useState(null);

  const { isLoading, sendRequest, onCloseError } = useHttpClient();
  const auth = useContext(AuthContext);
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL+'/session/topic/request/' + topic.substring(20));
        console.log(responseData);
        setSession(responseData);
      } catch (error) {
      }
    };
    fetchSession();
  }, []);

  const navigate = useNavigate();

  const handleAssist = async (session) => {

    if (!auth.isLoggedIn) {
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
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token
        }
      );
      navigate('/Chatbox/' + session._id); // Pass session as a prop




    } catch (error) {
      setError("Session has closed");
    }

  };
  const onClosedError = () => {
    setError(null);
};
  return (
    <React.Fragment>
        {error && (
        <ErrorOverlay error={error} onCloseError={onClosedError} />
      )}
      
      {isLoading && <LoadingSpinner asOverlay />}
      <div className='result-container'>

        {!isLoading &&
          loadedSession &&
          loadedSession.map((session) => (
            <div key={session.id} className='session-item'>
              <img src={session.image.img} alt={session.topic} className='session-image' />
              <h4 className='session-title'>{session.topic}</h4>
              <button className='button-86' onClick={() => handleAssist(session)} role='button'>
                Assist
              </button>
            </div>
          ))}


      </div>
    </React.Fragment>
  );
};

export default Assist;
