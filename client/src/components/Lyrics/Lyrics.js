import React, { useEffect, useState } from 'react';
import Get_Lyrics from '../../Services/Get_Lyrics';
import './Lyrics.css';


function Lyrics(){
  let [lyrics, set_lyrics] = useState(null);

  async function load_lyrics(){
    const old_lyrics = (lyrics?lyrics:null)
    for (let i = 0; i < 5; i++){
      if (old_lyrics === lyrics){
        Get_Lyrics().then(temp => {set_lyrics(temp); console.log(temp)});
      } else{
        break;
      }
    }
  }
  useEffect(() => load_lyrics(), []);

  return(
    <div className="lyrics-page-container">
      <div className="lyrick-header-container">
        <h1 className="lyrick-header">Lyrick</h1>
      </div>

      <div className="content-container">
        <div className="song-info-container">
          song info goes here
          {/* MAKE THIS IT'S OWN COMPONENT */}
          <button className="update-btn" onClick={load_lyrics}> Update </button>
        </div>
        <div className="lyrics-container">
          <div className="lyrics-text-container">
            <pre classname="lyrics-text">
              {lyrics ? lyrics : "Loading Lyrics"}
            </pre>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Lyrics;