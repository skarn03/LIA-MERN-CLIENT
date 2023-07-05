import magni from '../magni.jpg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Searchbar.css'

const Searchbar = ({ changeHeader }) => {
  const [defaultSearchText, setBarText] = useState("SEARCH ANYTHING");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    let text = document.querySelector(".textbox").value;
    SearchHandle({ text });
    navigate('/Result'); // Navigate to the '/result' route
  };

  const SearchHandle = (text) => {
    setBarText("TRY AGAIN");
    changeHeader('Ongoing Session for ' + text.text);
  };

  const textHandle = (event) => {
    console.log(event.target.value);
  };

  return (
    <div className="Search">
      <form className="bar" onSubmit={handleSubmit}>
        <input className="textbox" onChange={textHandle} type="text" placeholder={defaultSearchText} name="q" />
        <button className="clickable" type="submit">
          <img src={magni} alt="search" />
        </button>
      </form>
      <div></div>
    </div>
  );
};

export default Searchbar;
