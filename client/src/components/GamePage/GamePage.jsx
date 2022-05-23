import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { Box } from '@mui/system';
import LinearProgress from '@mui/material/LinearProgress';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { IconButton, Tooltip } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import styled from '@emotion/styled';

import { useEffect, useRef,useCallback } from 'react';
import { useState } from 'react';
import { axiosInstance } from '../../config';

import RecommendationContainer from '../RecommandationContaner/RecommendationContainer';

import "./gamepage.scss"

const ContainerRelativo = styled.div`
  position: relative;
  max-width: 100%;
`

const Container = styled.div`
  overflow-x: scroll;
  display: flex;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    display: none;
  }
  .buttons {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-between;
    max-width: 100%;
    width: 100%;
    button {
      background: #0000004e;
      border: none;
      padding: 8px 12px;
      cursor: pointer;
    }
    .prev {
      transform: translateX(10px);
    }
    .next {
      transform: translateX(-10px);
    }
  }
`

const metacriticColor = (rating) =>{
  if(rating >= 90) return "universal-acclaim";
  if(rating >= 75) return "generally-favourable";
  if(rating >= 50) return "mixed-review";
  if(rating >= 20) return "generally-unfavourable";
  return "overwhelmin-dislike";
}

export default function GamePage({currentGame, games, setGames, setFetchingGames, setCurrentGame, user}) {
  const [updating, setUpdating] = useState(false);
  const [index, setIndex] = useState(0);
  const listRef = useRef();

  function removeHTML(str){ 
    var tmp = document.createElement("DIV");
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || "";
  }

  const handleRedirect = () =>{
    window.location = "https://store.steampowered.com/app/" + currentGame.steam_appid;
  }

  useEffect(()=>{
    const updatePriority = async () =>{
      try{
        setUpdating(true);
        await axiosInstance.post("/priority/", {
          appid: currentGame.steam_appid
        })
      }catch(err){
        console.log(err);
      }finally{
        setUpdating(false);
      }
    }
    if(currentGame !== null && currentGame !== undefined){
      updatePriority();
    }
  }, [currentGame])

  const [stateCarosel, setStateCarousel] = useState()

  const handleCarousel = useCallback(() => {
    if(listRef.current) {
      const carousel = listRef.current
      setStateCarousel(
        {
          ...stateCarosel, 
          width_carosel: carousel.clientWidth,
          qnt_childrens: carousel.children.length,
          width_childrens: carousel.children.item(0)?.clientWidth,
          max_width_carousel: ((carousel.children.length -1) * carousel.children.item(0)?.clientWidth)
        }
      )
    }
  }, [setStateCarousel])

  const handleCarouselAction = (e, direction) => {
    e.preventDefault();
    switch (direction) {
      case "right":

        return listRef.current.scrollLeft += stateCarosel?.width_childrens
      case "left":
        return listRef.current.scrollLeft -= stateCarosel?.width_childrens
        
      default:
        return null
    }
  }

  useEffect(() => handleCarousel(), [handleCarousel])

  if(currentGame && !updating){
    return (
      <>
      <Box
        sx={{
          p: 2,
          width: "80%",
          margin: '0 auto',
          flexGrow: 1,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#1A2027' : '#cacccb',
        }}
      >
        <div className='game-details-main'>
          <Grid container spacing={2}>

            <Grid item sx={{p: 2, wordWrap: 'break-word', textOverflow: 'break-word', minWidth: 200}}>

              <ButtonBase sx={{mb: 3}}>
                <img
                alt={currentGame.name} 
                src={"https://cdn.akamai.steamstatic.com/steam/apps/" + currentGame.steam_appid + "/header.jpg"}
                onError={(e)=>{
                  e.target.src="./images/notfound.png"
                }}
                width="300"
                ></img>
              </ButtonBase>

              <Grid item sx={{minWidth: 10, maxWidth: 300}}>
                  <h4><b>{currentGame.name}</b></h4>
                  {currentGame.metacritic ? 
                  <div className='metacritic-container' onClick={()=>{
                    window.location = currentGame.metacritic.url;
                  }}>
                    <span className={'metacritic ' + metacriticColor(currentGame.metacritic.score)}>{currentGame.metacritic.score}</span>
                    <span className='metacritic-text'>metacritic</span>
                  </div>
                  
                  : ""}
                <Typography variant="body2" component="div" sx={{minWidth: 200, maxWidth: 300}}>
                  <b>Developer:</b> {currentGame.developers}
                </Typography>

                <Typography variant="body2" component="div" sx={{minWidth: 200, maxWidth: 300}}>
                  <b>Publisher:</b> {currentGame.publishers}
                </Typography>

                <Typography variant="body2" component="div" sx={{display: 'inline-block', minWidth: 200}}>
                <b>Description:</b> <br></br>
                
                {removeHTML(currentGame.short_description)}

                <Typography variant="body2" component="div" sx={{mt: 2}}>
                  {currentGame.genres.map(d=>(
                      <span className='genre-container' key={d.description}>{d.description}</span>
                  ))}
                </Typography>
                </Typography>
              </Grid>
            </Grid>
          
            <Grid md={6} sx={{m: 2,minWidth: 100}}>
              <span className="game-detail-main">
                  <div className="game-detail-right">
                      <div className='big-picture'>
                          <img
                              className="big-picture"
                              src={currentGame.screenshots[index].path_thumbnail}
                              alt={`screenshot from ${currentGame.name}`}
                          />
                      </div>
                      
                      <div className="screenshots-container">
                        <ArrowBackIosIcon sx={{cursor: 'pointer'}} onClick={(e)=>{handleCarouselAction(e, "left")}}/>
                        <div className="screenshots">
                            <ContainerRelativo max={stateCarosel?.max_width_carousel }>
                              <Container ref={listRef} className="screenshots-container">
                                {currentGame.screenshots.map((screenshot, idx) => {
                                    return (
                                      <img
                                        key={idx}
                                        className={'screenshot-img '+ (index === idx ? 'screenshot active' : 'screenshot')}
                                        onClick={() => {setIndex(idx)}}
                                        src={screenshot.path_thumbnail}
                                        alt={idx}
                                      />
                                    );
                                })}
                              </Container>
                            </ContainerRelativo>
                        </div>
                        &nbsp;<ArrowForwardIosIcon sx={{cursor: 'pointer'}} onClick={(e)=>{handleCarouselAction(e, "right")}}/>
                      </div>
                  </div>
              </span>
            </Grid>

            <Grid item sm>
              <List
                sx={{
                  width: '100%',
                  maxWidth: 360,
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'auto',
                  maxHeight: 360,
                  '& ul': { padding: 0 },
                  zIndex: 0
                }}
                subheader={
                  <ListSubheader component="div" id="nested-list-subheader">
                    Details
                  </ListSubheader>
                }
              >

                <ul>
                  {currentGame.categories.map((item) => (
                    <ListItemButton key={`item-${item.description}`}>
                      <ListItemText primary={`Item ${item.description}`} />
                    </ListItemButton>
                  ))}
                </ul>
              </List>
            </Grid>

          </Grid>
        </div>

        <div className='game-details-main'>
          <Grid container >
            {currentGame.pc_requirements.minimum?
            <Grid md={5} sm sx={{m: 2, minWidth: 100, maxWidth: 500}}>
            <Grid item md={10} sx={{minWidth: 100}}>
                <h4><b>Minimum Requirements</b></h4>
                <Typography variant="body2" component="div">
                  <ul>
                  {currentGame.pc_requirements.minimum.split('<li>').map(req=>(
                    <li key={req}>{removeHTML(req)}</li>
                  ))}
                  </ul>
                </Typography>
            </Grid>
            </Grid>: ""
          }
          
          { currentGame.pc_requirements.recommended ? 
            <Grid md={5} sx={{m: 2, minWidth: 100, maxWidth: 500}}>
            <Grid item md={10} sx={{minWidth: 100}}>
                  <h4><b>Recommended Requirements</b></h4>
                <Typography variant="body2" component="div">
                  <ul>
                  {currentGame.pc_requirements.recommended.split('<li>').map(req=>(
                    <li>{removeHTML(req)}</li>
                  ))}
                  </ul>
                </Typography>
              </Grid>
            </Grid>: ""
          }
          </Grid>
          
          <div className='game-detail-main'>
              Check out at Steam webstore : 
              <Tooltip title="Steam">
                <IconButton onClick={handleRedirect}>
                  <img src='./images/steam.png' width={"40px"} alt="steam"></img>
                </IconButton>
              </Tooltip>
          </div>
        </div>
      </Box>

      <div className='recommendations'>
        <h2 className='game-detail-main'>You Might also like</h2>
        <RecommendationContainer
          currentGame={currentGame}
          setFetchingGames={setFetchingGames}
          setCurrentGame={setCurrentGame}
          user={user}
        />
      </div>
      </>
    );
  }else{
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }
}
