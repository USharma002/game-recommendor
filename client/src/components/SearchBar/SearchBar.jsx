import { useEffect, useState } from 'react';

import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Tooltip } from '@mui/material';
import { Select } from '@mui/material';
import { MenuItem } from '@mui/material';
import { ListItemText } from '@mui/material';
import { ListItemButton } from '@mui/material';
import { List } from '@mui/material';
import { ListItem } from '@mui/material';
import { Box } from '@mui/system';

import { CircularProgress } from '@mui/material';

import "./searchbar.css"

import FilterModal from '../FilterModal/FilterModal';
import { axiosInstance } from '../../config';
import axios from 'axios';

export default function SearchBar({games, setGames, setFetchingGames, currentGame, setCurrentGame, genreCount, currentPage, setCurrentPage, searchTerm, setSearchTerm, filters, setFilters, count, setCount, theme, exclusions, setExclusions}) {
  const [showFilter, setShowFilter] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false)
  let source = axios.CancelToken.source();

  const handleBack = () =>{
    setCurrentGame(null);
  }

  const handleChange = async (e) =>{
    setSearchTerm(e.target.value);
    if(e.target.value.length > 1){
      try{
        source = axios.CancelToken.source();
        const cancelToken = source.token;

        setLoadingSuggestions(true);
        const res = await axiosInstance.post("/suggestions/", {
          name: e.target.value
        }, {
          cancelToken: cancelToken
        });
        setSuggestions(res.data);
      }catch(err){
        console.log(err);
      }finally{
        setLoadingSuggestions(false);
      }
    }else{
      setSuggestions([]);
    }
  }

  const handleClear = (e) =>{
    setSearchTerm('');
    setSuggestions([]);
  }

  const handleSubmit = (e) =>{
    e.preventDefault();
    const getSearchedGames = async () =>{
      try{
        setFetchingGames(true);
        setCurrentPage(1);
        const res = await axiosInstance.post("/search/", {
          page: 1,
          name: searchTerm,
          tags: filters,
          count: count,
          exclusions: exclusions
        });
        setGames(res.data);
      }
      catch(err){
        console.log(err);
      }finally{
        setFetchingGames(false);
        setCurrentGame(null)
      }
    }
    getSearchedGames();
  }

  return (
    <>
    <FilterModal
      showFilter={showFilter}
      setShowFilter={setShowFilter}
      filters={filters}
      setFilters={setFilters}
      exclusions={exclusions}
      setExclusions={setExclusions}
      genreCount={genreCount}
      searchTerm={searchTerm}
      setGames={setGames}
      setCurrentPage={setCurrentPage}
      count={count}
    />
    <div className={'search-container '+ theme+"-div"}>
      <Paper
        component="form"
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', minWidth: 320, width: '40vw' }}
      >
        {currentGame !== null?
          <IconButton sx={{float: 'left'}} onClick={handleBack}>
            <ArrowBackIcon/>
          </IconButton>
        :""
        }
        <InputBase
          onFocus={()=>{
            setShowSuggestion(true);
          }}
          onBlur={()=>{
            setShowSuggestion(false)
          }}
          id='search-bar'
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search for a game"
          onChange={handleChange}
          value={searchTerm}
          onSubmit={handleSubmit}
          onKeyPress={(ev) => {
            if (ev.key === 'Enter') {
              source.cancel('test cancellation');
              handleSubmit(ev);
              setSuggestions([]);
            }
          }}
        />
        <div className='suggestion-container'>
        <Box sx={{ minWidth: 470, width: '39vw', bgcolor: 'background.paper' }}>
        {suggestions.length === 0 || searchTerm.length < 2 || showSuggestion===false ? "":
        <List>
          {suggestions.map(suggestion => (
            <ListItem disablePadding key={suggestion.name}>
              <ListItemButton onClick={async ()=>{
                try{
                  setSuggestions([]);
                  setFetchingGames(true);
                  const res = await axiosInstance.post("/game/", {appid: suggestion.steam_appid});
                  await axiosInstance.post("/priority/", {
                    appid: res.data.steam_appid
                  })
                  setCurrentGame(res.data);
                }catch(err){
                  console.log(err);
                  setCurrentGame(undefined)
                }finally{
                  setFetchingGames(false);
                }
              }}>
                <ListItemText primary={suggestion.name} />
              </ListItemButton>
            </ListItem>
            ))
          }
        </List>
        }
        </Box>
        </div>

        {
        loadingSuggestions ?
          <CircularProgress size={'25px'}/>
          :""
        }

        {
          searchTerm.length > 0 ? 
          <Tooltip title="Clear">
            <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={handleClear}>
              <CloseIcon/>
            </IconButton>
          </Tooltip>
        :""
        }
        <Tooltip title="Search">
          <IconButton sx={{ p: '10px' }} aria-label="search" onClick={handleSubmit}>
            <SearchIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Filter">
          <IconButton sx={{ p: '10px' }} aria-label="filter" onClick={()=>{setShowFilter(true)}}>
            <FilterAltIcon />
          </IconButton>
        </Tooltip>

        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={count}
          label="Count"
          onChange={(e)=>{
            setCount(e.target.value);
            setCurrentPage(1);
          }}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={30}>30</MenuItem>
          <MenuItem value={40}>40</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>

      </Paper>
    </div>
    </>
  );
}
