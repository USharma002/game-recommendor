import React from 'react'
import MediaCard from '../MediaCard/MediaCard'

import "./gamecontainer.css"

export default function GameContainer({currentGame, setCurrentGame, games, setGames, setFetchingGames, user, loginShow, setLoginShow, likedGames, setLikedGames}) {

  return (
  <div>
    { games.length !== 0 ?
    <div className= 'game-container' id="game-container">
      {games?.map(game =>(
        
          <MediaCard 
            key={game.url}
            appid={game.steam_appid}
            setCurrentGame={setCurrentGame}
            user={user}
            setLoginShow={setLoginShow}
            loginShow={loginShow}
            likedGames={likedGames}
            setLikedGames={setLikedGames}
            datasetData={game}
          />
      ))
        
      }
    </div>:
    <div className='no-results flex-box'>
      <div className='center-div'>No Results Found</div>
    </div>
    }
  </div>
  )
}
