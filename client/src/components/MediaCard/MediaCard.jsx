import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, CardActions, LinearProgress } from '@mui/material';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { Tooltip } from '@mui/material';

import "./mediacard.css"
import { useEffect, useState } from 'react';
import { axiosInstance } from '../../config';

const metacriticColor = (rating) =>{
  if(rating >= 90) return "universal-acclaim";
  if(rating >= 75) return "generally-favourable";
  if(rating >= 50) return "mixed-review";
  if(rating >= 20) return "generally-unfavourable";
  return "overwhelmin-dislike";
}

export default function MultiActionAreaCard({user, appid, setCurrentGame, loginShow, setLoginShow, likedGames, setLikedGames, datasetData}) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [game, setGame] = useState(null);

  function removeHTML(str){ 
    var tmp = document.createElement("DIV");
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || "";
  }

  const handleLike = async () =>{
    if(user !== null){
      try{
        await axiosInstance.post("/like/", {
          email: user.email,
          appid: appid
        })
        if(likedGames.map(g => g.steam_appid).includes(appid)===true){
          console.log("unliked")
          setLikedGames(prev=> prev.filter(games => games.steam_appid !== appid));
        }else{
          setLikedGames(prev => [...prev, datasetData]);
        }
      }catch(err){
        console.log(err);
      }
    }else{
      setLoginShow(true);
    }
  }

  useEffect(()=>{
    const getGame = async ()=>{
      try{
        const res = await axiosInstance.post("/game/", {appid: appid});
        setGame(res.data);
      }catch(err){
        console.log(err);
        setGame(undefined);
      }
    }
    getGame();
  }, [appid])

  return (
    <span className='game-card'>
      <Card sx={{ maxWidth: 280, minWidth: 280, minHeight: 300, margin: 2 }}>
        { game === null ? <LinearProgress/>:
        <>
        <CardActionArea 
          onClick={async ()=>{
            if(game!== undefined){
              setCurrentGame(game);
            }
          }} 
          onMouseEnter={()=>{
            setShowTrailer(true && game?.movies !== undefined);
          }} 
          onMouseLeave={()=>{setShowTrailer(false)}}
        >
          { showTrailer === false || game === undefined?
          <CardMedia
            component="img"
            height="200"
            image={game !== undefined ? game?.header_image :"./images/notfound.png"}
            alt={game?.name}
            onError={(e)=>{
              e.target.src="./images/notfound.png"
            }}
          />
          
          :
          <CardMedia
            component="video"
            height="200"
            image={game?.movies[0].mp4["480"]}
            autoPlay
            muted
            controls
            alt={game?.name}
            onError={(e)=>{
              e.target.src="./images/notfound.png"
            }}
          />
          }
          <CardContent sx={{height: '150px'}}>
            <Typography gutterBottom variant="h5" component="div">
              {
                game === undefined ?
                "Unable to Load":
                game?.name?.length > 30 ? game?.name?.substring(0, 30) + '...' : game?.name
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" height={'50px'}>
              { game?.about_the_game?.length > 80 ? removeHTML(game?.about_the_game)?.substring(0, 80) + '...' : removeHTML(game?.about_the_game)}
            </Typography>
          </CardContent>
        </CardActionArea>

        <CardActions disableSpacing>
          <Tooltip title="Like">
            <IconButton size="small" color="primary" className={'like-btn ' + (likedGames?.map(g => g.steam_appid).includes(appid) ? 'liked': '')} onClick={handleLike}>
              {
                likedGames?.map(g => g.steam_appid).includes(appid) ? <FavoriteIcon/>:<FavoriteBorderIcon/>
              }
            </IconButton>
          </Tooltip>

          <Tooltip title="Price">
            <IconButton size="small" color="primary" className='dislike-btn'>
              {game===undefined || game?.price_overview === undefined ? (game && game?.is_free ? "Free": "No data") : game.price_overview.final_formatted}
            </IconButton>
          </Tooltip>
          
          {game?.metacritic ? 
          <Tooltip title={"Metacritic : " + game.metacritic.score}>
            <IconButton size="small" color="primary" className='metacritic-btn' sx={{ml: 'auto'}}>
              <span className={'metacritic-small ' + metacriticColor(game.metacritic.score)}>{game.metacritic.score}</span>
            </IconButton>
          </Tooltip>
          : ""}
        </CardActions>
        </>
      }
      </Card>
    </span>
  );
}
