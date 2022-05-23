import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Logout, Settings } from '@mui/icons-material';
import { ListItemIcon } from '@mui/material';
import { Divider } from '@mui/material';
import LoginModal from '../LoginModal/LoginModal';
import { axiosInstance } from '../../config';

import AboutModal from '../AboutModal/AboutModal';
import LikedGamesModal from '../LikedGamesModal/LikedGamesModal';

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import "./topbar.css"

export default function TopBar({theme, setTheme, setCurrentGame, games, setGames, setFetchingGames, setCurrentPage, setSearchTerm, setFilters, count, user, setUser, exclusions, setExclusions, loginShow, setLoginShow, likedGames, setLikedGames}){
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [aboutShow, setAboutShow] = useState(false);
  const [likedShow, setLikedShow] = useState(false);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
        <AppBar position="static">
        <Container maxWidth="xl">
            <Toolbar disableGutters>
            
            <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, cursor:'pointer' }}
                onClick={()=>{
                    setCurrentGame(null);
                    const getGames = async () =>{
                        try{
                            setFetchingGames(true);
                            setCurrentPage(1);
                            setFilters([]);
                            setExclusions([]);
                            setSearchTerm('');
                            const games = await axiosInstance.post("/search/", {
                                page: 1,
                                name: "",
                                tags: [],
                                count: count,
                                exclusions: []
                            })
                            setGames(games.data)
                        }catch(err){
                            console.log(err)
                        }finally{
                            setFetchingGames(false);
                        }
                      }
                      getGames()
                }}
            >
                GameRec
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
                >
                <MenuIcon />
                </IconButton>
                <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                    display: { xs: 'block', md: 'none' },
                }}
                >
                
                
                <MenuItem onClick={()=>{
                    handleCloseNavMenu()
                    setAboutShow(true);
                    }}>
                    <Typography textAlign="center">About</Typography>
                </MenuItem>
                
                
                </Menu>
            </Box>

            <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ cursor: 'pointer', flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
                onClick={
                    ()=>{
                        const getGames = async () =>{
                            try{
                              setFetchingGames(true);
                              setFilters([]);
                              setExclusions([]);
                              setCurrentPage(1);
                              setSearchTerm('');
                              setCurrentGame(null);
                              const games = await axiosInstance.post("/search/", {
                                page: 1,
                                name: "",
                                tags: [],
                                count: count,
                                exclusions: []
                              });
                              setGames(games.data)
                            }catch(err){
                              console.log(err)
                            }finally{
                              setFetchingGames(false);
                            }
                          }
                          getGames()
                    }
                }
            >
                GAME RECOMMENDER
            </Typography>
            
            <AboutModal 
                setAboutShow={setAboutShow}
                aboutShow={aboutShow}
            />
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                <Button
                    onClick={()=>{setAboutShow(true)}}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                >
                    About
                </Button>
            </Box>
            
            <Tooltip title={theme==='light'? "Dark Mode": "Light Mode"}>
                <IconButton sx={{ ml: 1 }} onClick={()=>{setTheme(prev=> prev==='light'? 'dark' : 'light')}} color="inherit" className='theme-selector'>
                        {theme === 'dark' ? 
                        <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Tooltip>

        { user === null ? 
        <>
        <Button
            variant="outlined" 
            className="highlighted"
            onClick={()=>{
                setLoginShow(true);
            }}
        >Sign In</Button>
        <LoginModal
            loginShow={loginShow}
            setLoginShow={setLoginShow}
            user={user}
            setUser={setUser}
        />
        </>
        :    <Box sx={{ flexGrow: 0 }}>

                <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <Avatar alt={user.username} src="/static/images/avatar/2.jpg" />
                    </IconButton>
                </Tooltip>
                <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                >

                <MenuItem onClick={()=>{
                    setLikedShow(true);
                    setAnchorElUser(false);
                }}>
                    Liked Games
                </MenuItem>
                <LikedGamesModal
                    likedShow={likedShow}
                    setLikedShow={setLikedShow}
                    likedGames={likedGames}
                    setLikedGames={setLikedGames}
                    setCurrentGame={setCurrentGame}
                    user={user}
                />

                <Divider />

                <MenuItem>
                <ListItemIcon>
                    <Settings fontSize="small" />
                </ListItemIcon>
                Settings
                </MenuItem>

                <MenuItem onClick={()=>{
                    setUser(null);
                    setAnchorElUser(null);
                }}>
                <ListItemIcon>
                    <Logout fontSize="small" />
                </ListItemIcon>
                Logout
                </MenuItem>
                </Menu>
            </Box>
        }
            </Toolbar>
        </Container>
        </AppBar>
  );
};
