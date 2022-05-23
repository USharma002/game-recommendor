import * as React from 'react';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';
import { axiosInstance } from '../../config';

import "./bottombar.css"

export default function BottomBar({games, currentPage, setCurrentPage, filters, searchTerm, setGames, setFetchingGames, count, theme, exclusions}) {

  const getGames = async (filters, currentPage, searchTerm, exclusions) =>{
    try{
      setFetchingGames(true);
      console.log(filters)
      const games = await axiosInstance.post("/search/", {
        page: currentPage,
        name: searchTerm,
        tags: filters,
        count: count,
        exclusions: exclusions
      });
      setGames(games.data)
    }catch(err){
      console.log(err)
    }finally{
      setFetchingGames(false);
    }
  }

  const  nextPage = () =>{
    setCurrentPage(prev =>{
      if(games.length < 10){
        return prev;
      }
      getGames(filters, prev + 1, searchTerm, exclusions);
      return prev + 1;
    });
  }

  const prevPage = () =>{
    setCurrentPage(prev => {
      if(prev === 1){
        return prev;
      }else{
        getGames(filters, prev - 1, searchTerm, exclusions);
        return prev - 1;
      }
    })
  }
  return (
    <Box sx={{ width: '100%', position: 'fixed', bottom: 0}}>
      <div className={'center-div '+ theme + "-div"}>
        { currentPage === 1? "":
        <IconButton sx={{mr:2}} onClick={prevPage}>
          <ArrowBackIcon/>
        </IconButton>
        }

        <IconButton>
          {currentPage}
        </IconButton>

        {games?.length < count ? "" :
        <IconButton sx={{ml:2}} onClick={nextPage}>
          <ArrowForwardIcon/>
        </IconButton>
        }
      </div>
    </Box>
  );
}
