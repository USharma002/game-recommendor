import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Divider, Icon, IconButton } from '@mui/material';
import { Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Tooltip } from '@mui/material';

import "./filtermodal.css"
import { axiosInstance } from '../../config';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40vw',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  minWidth:'350px'
};

export default function FilterModal({showFilter, setShowFilter, filters, setFilters, genreCount, searchTerm, setGames, setCurrentPage, count, exclusions, setExclusions}) {
  const handleClose = () => setShowFilter(false);

  const handleTag = (genre) =>{
    if(filters.includes(genre)){
      setFilters(prev => prev.filter(f => f!==genre))
      setExclusions(prev => [...prev, genre]);
    }else if(exclusions.includes(genre)){
      setExclusions(prev => prev.filter(f => f!==genre))
    }else{
      setFilters(prev => [...prev, genre]);
    }
  }

  const handleTagSearch = async () =>{
    try{
      setCurrentPage(1);
      const res = await axiosInstance.post("/search/", {
        page: 1,
        name: searchTerm,
        tags: filters,
        count: count,
        exclusions: exclusions
      });
      setGames(res.data)
    }catch(err){
      console.log(err);
    }
  }

  return (
    <>
      <Modal
        open={showFilter}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Select Genre
            <Tooltip title="Clear">
              
              <IconButton sx={{ p: '10px', float: 'right' }} aria-label="clear" onClick={()=>{setShowFilter(false)}}>
                <CloseIcon/>
              </IconButton>
            </Tooltip>
          </Typography>
          <Divider/>
          <Typography id="modal-modal-description" sx={{ m: 1, maxHeight: "200px", overflow: 'auto' }}>
            {
              filters.length === 0 && exclusions.length === 0 ?
              <p className='center-div'>
                No filters selected
              </p>
              : ""
            }
            {
              filters.map(f => (
                <span key={f}
                  className={'genre-container' + (filters.includes(f)===true ? " selected": '')}
                  onClick={()=>setFilters(prev => prev.filter(x=> x!== f))}
                >
                    {filters.includes(f)===true ? <AddIcon/>: ""}
                  {f}
                </span>
              ))
            }
            {exclusions.map(f => (
                <span key={f}
                  className={'genre-container' + (exclusions.includes(f)===true ? " excluded": '')}
                  onClick={()=>setExclusions(prev=> prev.filter(x=> x!==f))}
                >
                    {exclusions.includes(f)===true ? <RemoveIcon/>: ""}
                  {f}
                </span>
              ))
            }
          </Typography>
          <Divider/>

          <Button variant="contained" sx={{mt: 2, mb: 2}} onClick={handleTagSearch}>
            Save Changes
          </Button>
          <Button variant="contained" sx={{mt: 2, float: 'right'}} onClick={()=>{
            setFilters([]);
            setExclusions([]);
          }}>
            Reset
          </Button>

          <Divider/>
          <Typography id="modal-modal-description" sx={{ mt: 2, maxHeight: "400px", overflow: 'auto' }}>
            {
              Object.keys(genreCount.current).sort((a, b)=>a.localeCompare(b)).map(genre=>(
                <Tooltip title={"Count : " + genreCount.current[genre]} key={genre}>
                <span
                  className={'genre-container' + (filters.includes(genre)===true ? " selected": '') + (exclusions.includes(genre)===true ? " excluded": '')}
                  onClick={()=>{handleTag(genre)}}
                >{filters.includes(genre)===true ? <AddIcon/>: ""}
                 {exclusions.includes(genre)===true ? <RemoveIcon/>: ""}
                  {genre}
                </span>
                </Tooltip>
              ))
            }
          </Typography>
          <Divider/>          
        </Box>
      </Modal>
    </>
  );
}