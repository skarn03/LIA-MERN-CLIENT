import React, { useState, useEffect, useContext } from 'react';
import './Chatbox.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useHttpClient from './Shared/hooks/http-hook';
import { useRef } from 'react';
import io from 'socket.io-client';
import ScrollToBottom from 'react-scroll-to-bottom';
import { AuthContext } from './Shared/context/auth-context';
import LoadingSpinner from './Shared/LoadingSpinner';

const socket = io.connect(process.env.REACT_APP_SOCKET_URL);
const Chatbox = ({ changeHeader, isDirecting, userID, header }) => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, onCloseError } = useHttpClient();
  const navigate = useNavigate();
  let { sID } = useParams();
  const [rum, setrum] = useState(sID);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('ChatRoom For ' + header.substring(19));
  let [isUnmounting, setIsUnmounting] = useState(false); // Track unmounting state
  let [isRouting, setIsRouting] = useState(false);
  const location = useLocation();
  const isInitialRender = useRef(true);
  const previousRoute = useRef('');
  const isRedirecting = useRef(false);
  const [user, setUser] = useState();
  const [session, setSession] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [userList, setUserList] = useState([]);
  const[load,setLoad] = useState(false);


  const handleToggle = async () => {
    setIsToggled(prevState => !prevState);
    try {
      const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL+'/session/public/' + sID, 'PATCH', null, {
        Authorization: 'Bearer ' + auth.token
      });
    } catch (error) {

    }
  };



  const fetchUsersSessionxyz = async () => {
    console.log('getting users');
    try {
      const response = await sendRequest(process.env.REACT_APP_BACKEND_URL+'/users/xyz/abc/',
        'POST', JSON.stringify({
          topic: sID,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token

        }
      );


      const responseData = await response;


      setUserList(responseData.allsessions.users);
      //setUserList(responseData.allsessions[0].users);

    } catch (error) {

      console.log(`[+]fetch users`, error);

    }

  };

  useEffect(() => {
    fetchUsersSessionxyz();
  }, [])
  useEffect(() => {

    socket.emit("join_room", sID);
    console.log("User joined");
  }, [])
  const fetchSession = async () => {
    try {
      const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL+'/session/' + sID);
      setSession(responseData.session);
      setIsAdmin(responseData.session.users[0] == userID);
      return responseData.session;
    } catch (error) {
      // Handle error
    }
  };
  useEffect(() => {
    //fetch session

    const tempSess = fetchSession();
    //fetch user
    const fetchUser = async (ID) => {
      try {
        const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL+'/users/' + ID);
        const user = responseData.user;
        setUser(user);

        if (user && user.name) {
          const connectMessage = {
            id: Date.now(),
            content: `${user.name} has connected to the chat`,
            author: { name: 'System' },
            room: sID,
            time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
          };
          await socket.emit("send_message", connectMessage);
          setMessages(prevMessages => [...prevMessages, connectMessage]);

        }
      } catch (error) {
        // Handle error
      }
    };
    const tempUser = fetchUser(userID);
  }, []);



  useEffect(() => {

    const handleBeforeUnload = async () => {
      isAdmin && await handleLeaveChat();
      !isAdmin && await leaveChat();

    };

    const handleRouteChange = async () => {
      isAdmin && await handleLeaveChat();
      !isAdmin && await leaveChat();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleRouteChange); // Listen to route changes

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleRouteChange);
      setIsUnmounting(true); // Set unmounting state
      setIsRouting(true);
    };
  }, []);


  useEffect(() => {
    if (isUnmounting) {
      handleLeaveChat();
    }
  }, [isUnmounting]);
  useEffect(() => {
    if (isRouting) {
      isAdmin && handleLeaveChat();
    }
  }, [isRouting]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      previousRoute.current = location.pathname;
      return;
    }
    const currentRoute = location.pathname;
    const chatboxRoute = '/chatbox/' + sID;

    if (previousRoute.current === chatboxRoute && currentRoute !== chatboxRoute) {
      setIsUnmounting(false);

      isAdmin && handleLeaveChat();
    }
    previousRoute.current = currentRoute;
  }, [location.pathname]);


  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const leaveChat = async () => {
    setLoad(true)
    try {
      const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL+'/session/' + sID, 'PATCH',
        JSON.stringify({
          joining: false,
          newUserId: userID,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token

        });

      await fetchUsersSessionxyz();
    } catch (error) {

    }
    finally {
      if (user && user.name) {
        const leaveMessage = {
          id: Date.now(),
          content: `${user.name} has left the chat`,
          author: { name: 'System' },
          room: sID,
          time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
        };
        
        await socket.emit("send_message", leaveMessage);
        setMessages(prevMessages => [...prevMessages, leaveMessage]);
        socket.emit('leave_room', sID);
        setLoad(false);
        setrum("");
        changeHeader('Learn It All');
        navigate('/');
      }
    }
  }
  const handleSendMessage = async () => {
    if (inputValue.trim() !== '' && user && user.name) {
      const newMessage = {
        id: Date.now(),
        content: inputValue.trim(),
        author: user,
        room: sID,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };
      console.log('inside chat', newMessage.author);
      await socket.emit("send_message", newMessage);
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputValue('');
    }
  };

  useEffect(() => {
    // socket.off("receive_message").on("receive_message", (data) => {
    //   setMessages(prevMessages => [...prevMessages, data]);
    // })
    const recieveFunctionData = (data) => {

      fetchUsersSessionxyz();
      setMessages(prevMessages => [...prevMessages, data]);
    }
    const navigateClient = (data) => {
      setrum("");
      data.room = "";

      changeHeader('Learn It All');
      navigate('/');
    }
    socket.on("receive_message", recieveFunctionData);
    socket.on("navigate_client", navigateClient);

    return () => {
      socket.off("receive_message", recieveFunctionData);
    };
  }, [socket])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleLeaveChat = async () => {
    setLoad(true);
    if (!isUnmounting || !isRouting) { // Check if component is unmounting
      console.log('leaving');
      try {
        if (user && user.name) {
          const leaveMessage = {
            id: Date.now(),
            content: `${user.name} has left the chat`,
            author: { name: 'System' },
            room: sID,
            time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
          };
          await socket.emit("send_message", leaveMessage);
          setMessages(prevMessages => [...prevMessages, leaveMessage]);
        }

        const data = {
          room: rum,
          session: await fetchSession(),
          user: userID
        }

        await sendRequest(
          process.env.REACT_APP_BACKEND_URL+'/session/' + sID,
          'DELETE',
          null,
          {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + auth.token
          }
        );


        socket.emit("navigate_to_home", data)
        setLoad(false);
        navigate('/');
        changeHeader('Learn It All');

      } catch (err) { }
    }
    setLoad(false);
  };


  return (
    <React.Fragment>
    {isLoading || load && <LoadingSpinner asOverlay />}

    <div className="chat-container">
      <div className="chat-header">
        {isAdmin &&
          <div className="checkbox-wrapper-10">
            <div className="toggle-container">
              <h5 className='public'> Help Recieved? </h5>

              <input checked={isToggled} type="checkbox" id="cb5" onChange={handleToggle} className="tgl tgl-flip" />
              <label for="cb5" data-tg-on="Yeah!" data-tg-off="Nope" className="tgl-btn"></label>
            </div>
          </div>}
          
        <button className="button" id={isAdmin ? "youBox" : "otherBox"} onClick={() => {
          isUnmounting = false;
          isRouting = false;
          isAdmin ? handleLeaveChat() : leaveChat();
        }}>
          <svg viewBox="0 0 448 512" className="svgIcon">
            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path>
          </svg>
        </button>

      </div>
      {user && userList &&
        <div className='splitter'>
          <div className='userlist'>
            {userList.map(userHere => (
              <div className='names' id={user.name == userHere.name ? "yu" : "nyu"} key={userHere.id}> {userHere.name}</div>
            ))}

          </div>
          <div className="chat-messages">
            <ScrollToBottom className='scroller'>
              {messages.map((message) => (
                <div key={message.id} className="message-container" id={userID === message.author.id ? "you" : "other"}>
                  <div className="message-info">
                    {message.author.name}
                  </div>
                  <div className="message">
                    {message.content}
                    <div className="message-time">{message.time}</div>
                  </div>


                </div>
              ))}
            </ScrollToBottom>
          </div>
        </div>
      }
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {/* <button className="send-button" onClick={handleSendMessage}>
          Send
        </button> */}
        <button className="button21" onClick={handleSendMessage}>
          <span className="button_lg">
            <span className="button_sl"></span>
            <span className="button_text">SEND</span>
          </span>
        </button>
      </div>
    </div>
    </React.Fragment>
  );
};

export default Chatbox;
