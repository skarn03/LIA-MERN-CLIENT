import React, { useEffect,Suspense, useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import Searchbar from './Search/Searchbar';
//import Result from './AfterSearch/Result';
import Navbar from './Navigation/Navbar';
// import LoginForm from './Navigation/Login/LoginForm';
//import Chatbox from './Chatbox';
//import Assist from './AfterSearch/Assist';
import { AuthContext } from './Shared/context/auth-context';
import { useAuth } from './Shared/hooks/auth-hook';
import LoadingSpinner from './Shared/LoadingSpinner';

const Result = React.lazy(() => import('./AfterSearch/Result'));
const LoginForm = React.lazy(() => import('./Navigation/Login/LoginForm'));
const Chatbox = React.lazy(() => import('./Chatbox'));
const Assist = React.lazy(() => import('./AfterSearch/Assist'));


function App() {
  const [isDirecting, setIsDirecting] = useState(false);
  const { token, login, logout, userID } = useAuth();

  const [header, setHeader] = useState('Learn It All');

  let routes;
  if (token) {
    routes = (
      <React.Fragment>
        <Route exact path="/" element={<Searchbar changeHeader={setHeader} />} />
        <Route path="/Result" element={<Result changeHeader={setHeader} topic={header} />} />
        <Route path="/Chatbox/:sID" element={<Chatbox changeHeader={setHeader} isDirecting={isDirecting} userID={userID} header={header} />} />
        <Route path="/Assist" element={<Assist changeHeader={setHeader} topic={header} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </React.Fragment>
    );
  } else {
    routes = (
      <React.Fragment>
        <Route exact path="/" element={<Searchbar changeHeader={setHeader} />} />
        <Route path="/Result" element={<Result changeHeader={setHeader} topic={header} />} />
        <Route path="/Login" element={<LoginForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </React.Fragment>
    );
  }



  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, token: token, userID: userID, login: login, logout: logout }}>
      <Router>
        <div className="App">
          <Navbar header={header} headersetter={setHeader} setIsDirecting={setIsDirecting} />
          <div className="aSearch">
          <Suspense fallback={<div className='center'> LoadingSpinner</div>}>
            <Routes>
              {routes}
            </Routes>
            </Suspense>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
