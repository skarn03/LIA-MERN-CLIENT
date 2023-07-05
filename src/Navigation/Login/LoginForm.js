import React, { useState, useContext } from 'react';
import LoadingSpinner from '../../Shared/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Shared/context/auth-context';
import ErrorOverlay from '../../Shared/ErrorOverlay';
import useHttpClient from '../../Shared/hooks/http-hook';
import './LoginForm.css';
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { isLoading, error, sendRequest, onCloseError } = useHttpClient();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    validateEmail(email);
    validatePassword(password);
    if (!isRegistering) {
      handleLogin();
    } else {
      handleRegister();
    }
    // Perform login or registration logic here
  };

  const toggleRegister = () => {
    setIsRegistering((prevValue) => !prevValue);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(URL.createObjectURL(file));
  };

  const validateEmail = (email) => {
    if (email.length <= 6) {
      setEmailError('Too short');
    } else if (
      !email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      setEmailError('Missing or invalid Character');
    } else {
      setEmailError('');
      return true;
    }
  };

  const validatePassword = (password) => {
    if (
      !password.match(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,32})/)
    ) {
      setPasswordError(
        'Password should contain at least one number, one special character, and an uppercase letter'
      );
    } else {
      setPasswordError('');
      return true;
    }
  };

  const handleLogin = async (event) => {
    try {
      const responseData = await sendRequest(
        process.env.REACT_APP_BACKEND_URL+'/users/login', 'POST', JSON.stringify({
          email: email,
          password: password
        }),
        {
          'Content-Type': 'application/json',
        }
      );
      console.log(responseData);
      auth.login(responseData.user.id, responseData.token);
    } catch (err) {
      validateEmail(email);
      validatePassword(password);
    }
  };

  const handleRegister = async (event) => {


    try {
      const responseData = await sendRequest(
        process.env.REACT_APP_BACKEND_URL+'/users/signup/', 'POST', JSON.stringify({
          name: fullName,
          email: email,
          password: password,
          DOB: dob,
        }), {
        'Content-Type': 'application/json',
      });
      console.log(responseData);
      auth.login(responseData.user.id, responseData.token);
    } catch (err) {
      validateEmail(email);
      validatePassword(password);
    }
  };



  return (
    <React.Fragment>
      {error && (
        <ErrorOverlay error={error} onCloseError={onCloseError} />
      )}
      <div className="login-container">
        <div
          className={`login-form-container ${isRegistering ? 'register' : null
            } fade-in`}
        >
          {isLoading && <LoadingSpinner asOverlay />}
          <h2 className="login-heading">
            {isRegistering ? 'Register' : 'Login'}
          </h2>

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="profilePicture" className="form-label">
                  Profile Picture
                </label>
                <label htmlFor="profilePicture" className="profile-picture-label">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile Picture"
                      className="profile-picture"
                    />
                  ) : (
                    <div className="profile-picture-placeholder">Choose File</div>
                  )}
                  <input
                    type="file"
                    id="profilePicture"
                    onChange={handleProfilePictureChange}
                    className="form-input profile-picture-input"
                  />
                </label>
              </div>
            )}
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                />
              </div>
            )}
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="dob" className="form-label">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="form-input"
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);

                }}
                className="form-input"
              />
              <p className="error">{emailError}</p>
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);

                }}
                className="form-input"
              />
              <p className="error">{passwordError}</p>
            </div>
            <button
              type="submit"
              className="login-button"
              onClick={() => {
                if (!isRegistering) {
                  handleLogin();
                } else {
                  handleRegister();
                }
              }}
            >
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>
          <div className="register-link-container">
            <p>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            </p>
            {/* <span className="register-link" onClick={toggleRegister}>
              {isRegistering ? 'Login' : 'Register'}
            </span> */}
            <button class="continue-application" onClick={toggleRegister}>
              <div>
                <div class="pencil"></div>
                <div class="folder">
                  <div class="top">
                    <svg viewBox="0 0 24 27">
                      <path d="M1,0 L23,0 C23.5522847,-1.01453063e-16 24,0.44771525 24,1 L24,8.17157288 C24,8.70200585 23.7892863,9.21071368 23.4142136,9.58578644 L20.5857864,12.4142136 C20.2107137,12.7892863 20,13.2979941 20,13.8284271 L20,26 C20,26.5522847 19.5522847,27 19,27 L1,27 C0.44771525,27 6.76353751e-17,26.5522847 0,26 L0,1 C-6.76353751e-17,0.44771525 0.44771525,1.01453063e-16 1,0 Z"></path>
                    </svg>
                  </div>
                  <div class="paper"></div>
                </div>
              </div>
              {isRegistering ? 'Login' : 'Register'}
            </button>
          </div>
        </div>

      </div>
    </React.Fragment>
  );
};

export default LoginForm;
