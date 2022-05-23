import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../../config';
import MediaCard from '../MediaCard/MediaCard'

import "./recommendationcontainer.css"

export default function RecommendationContainer({currentGame, setCurrentGame,  user, setFetchingGames, loginShow, setLoginShow}) {
  const [games, setGames] = useState([]);

  useEffect(()=>{
    const getRecommendations = async () =>{
      try{
        const res = await axiosInstance.post("/recommend/", {
          appid: currentGame.steam_appid,
          user: user,
          count: 8
        })
        setGames(res.data);
      }catch(err){
        console.log(err);
      }
    }
    getRecommendations();
  }, [user, currentGame])
  
  return (
  <div>
    { games?.length !== 0 && games !== undefined ?
    <div className='recommended-container' id="recommend-container">
      {games?.map(game =>(
          <MediaCard 
            key={game?.url}
            appid={game?.steam_appid}
            setCurrentGame={setCurrentGame}
            loginShow={loginShow}
            setLoginShow={setLoginShow}
          />
      ))}
    </div>:
    <h3>
      <div className='center-div'>Something went wrong :(</div>
    </h3>
    }
  </div>
  )
}
