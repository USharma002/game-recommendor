import React, { useState, useEffect, useRef } from 'react'
import GameContainer from '../../components/GameContainer/GameContainer';
import SearchBar from '../../components/SearchBar/SearchBar';
import TopBar from '../../components/TopBar/TopBar'
import GamePage from '../../components/GamePage/GamePage';
import BottomBar from '../../components/BottomBar/BottomBar';

import { axiosInstance } from '../../config';

import { useTransition, animated } from 'react-spring';

import "./home.css"
import { LinearProgress } from '@mui/material';

export default function Home({theme, setTheme}) {
  const [user, setUser] = useState(null);
  const [likedGames, setLikedGames] = useState([]);

  const [games, setGames] = useState([])
  const [currentGame, setCurrentGame] =  useState(null);
  const [fetchingGames, setFetchingGames] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState([]);
  const [exclusions, setExclusions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(10);
  const [loginShow, setLoginShow] = useState(false);

  const genreCount = useRef([]);

  const transition = useTransition(currentGame == null, {
    enter: {x: 0, y:0, opacity: 1},
    leave:{x: 100, y: 0, opacity: 0},
    from: {x: -100, y: 0, opacity: 0, position: 'absolute'}
  })

  useEffect(()=>{
    const getLikedGames = async () =>{
      try{
        const res = await axiosInstance.post("/likedgames/", {
          email: user.email
        })
        setLikedGames(res.data);
      }catch(err){
        console.log(err);
      }
    }
    user && getLikedGames();
  }, [user])

  useEffect(()=>{
    const getGenre = async () =>{
      try{
        setFetchingGames(true);
        const res = await axiosInstance.get("/genre/")
        genreCount.current = res.data
        console.log(res.data)
      }catch(err){
        console.log(err)
      }finally{
        setFetchingGames(false);
      }
    }
    getGenre()
  }, [])

  
  useEffect(()=>{
    getGames(currentPage, searchTerm, filters, count, exclusions);
  }, [count])

  const getGames = async (page, name, tags, count, exclusions) =>{
    try{
      setFetchingGames(true);
      const games = await axiosInstance.post("/search/", {
        page: page,
        name: name,
        tags: tags,
        exclusions: exclusions,
        count: count
      });
      setGames(games.data);
    }catch(err){
      console.log(err)
    }finally{
      setFetchingGames(false);
    }
  }

  return (
    <>
    <div className='flex-box'>

      <div className='relative-container'>
        <div className='fixed-container'>
        <TopBar
          theme={theme} 
          setTheme={setTheme}
          setCurrentGame={setCurrentGame}
          games={games}
          setGames={setGames}
          setFetchingGames={setFetchingGames}
          currentPage={currentPage}
          setFilters={setFilters}
          setExclusions={setExclusions}
          setSearchTerm={setSearchTerm}
          setCurrentPage={setCurrentPage}
          count={count}
          user={user}
          setUser={setUser}
          loginShow={loginShow}
          setLoginShow={setLoginShow}
          likedGames={likedGames}
          setLikedGames={setLikedGames}
        />
        <SearchBar
          games={games}
          setGames={setGames}
          setFetchingGames={setFetchingGames}
          currentGame={currentGame}
          setCurrentGame={setCurrentGame}
          genreCount={genreCount}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          exclusions={exclusions}
          setExclusions={setExclusions}
          count={count}
          setCount={setCount}
          theme={theme}
        />
        </div>
      </div>

      <div className='relative-container'>
      {fetchingGames ? <LinearProgress/>
      :
        transition((style, item)=>
          item ?
          <animated.div style={style} className="animated-container">
            <GameContainer
              currentGame={currentGame}
              setCurrentGame={setCurrentGame}
              games={games}
              setGames={setGames}
              setFetchingGames={setFetchingGames}
              currentPage={currentPage}
              user={user}
              loginShow={loginShow}
              setLoginShow={setLoginShow}
              likedGames={likedGames}
              setLikedGames={setLikedGames}
            />
              <BottomBar 
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setFetchingGames={setFetchingGames}
              setGames={setGames}
              filters={filters}
              exclusions={exclusions}
              searchTerm={searchTerm}
              games={games}
              count={count}
              theme={theme}
              />
          </animated.div>
          :
          <animated.div style={style} className="animated-container">
            <GamePage 
            currentGame={currentGame}
            setFetchingGames={setFetchingGames}
            games={games}
            setGames={setGames}
            setCurrentGame={setCurrentGame}
            user={user}
            />
          </animated.div>
        )
      }
      </div>
    </div>
    </>
    
  );
}