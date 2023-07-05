import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import './Navbar.css';
import { AuthContext } from "../Shared/context/auth-context";
const Navbar = ({ header, headersetter, setIsDirecting }) => {
  const auth = useContext(AuthContext);
  const [signInLink, setSignInLink] = useState('/login');

  const handleClick = (e) => {
    e.preventDefault();
    headersetter('Learn It All');
    setSignInLink((prevLink) => (prevLink === '/login' ? '/' : '/login'));
  };
  return (<div className='Title'>
    <Link to='/' onClick={(e) => {
      setIsDirecting(true)
      headersetter('Learn It All');
    }} style={{ textDecoration: "none" }}>
      <div className="header-container">
        <h1>{header}</h1>
      </div>
    </Link>
    {!auth.isLoggedIn &&
      <Link to='/'
        className="signbox"

        style={{ textDecoration: "none" }}
        onClick={(e) => {
          handleClick(e)
        }
        }>
        <Link to={signInLink}>
          <button className="button-81" role="button">Sign In</button>

        </Link>
      </Link>}
    {auth.isLoggedIn &&


      <div className="signbox">
        <button className="button-81" role="button" onClick={() => {
          auth.logout();

        }}>Sign Out</button>
      </div>


    }

  </div>);
}

export default Navbar;