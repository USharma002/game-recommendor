import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Tooltip } from '@mui/material';

import GameContainer from '../GameContainer/GameContainer';

const style = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50vw',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 1,
  minWidth:'90%',
  maxWidth:'600px',
  minHeight: '600px',
  maxHeight: '90%',
};

export default function LikedGamesModal({likedShow, setLikedShow, setCurrentGame, likedGames, setLikedGames, user}){
  const handleClose = () =>{
    setLikedShow(false);
  };

  return (
    <div>
      <Modal
        open={likedShow}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{p: 2}}>
            LikedGames
            <Tooltip title="Close">
              <IconButton sx={{ p: '10px', float: 'right' }} aria-label="clear" onClick={handleClose}>
                <CloseIcon/>
              </IconButton>
            </Tooltip>
          </Typography>
          <Divider/>

          <Typography id="modal-modal-description" sx={{maxHeight: "600px", minHeight: '100%', overflow: 'auto', minWidth: '100%' }}>
            <GameContainer
              user={user}
              setCurrentGame={setCurrentGame}
              games={likedGames}
              likedGames={likedGames}
              setLikedGames={setLikedGames}
              loginShow={false}
              setLoginShow={()=>{}}
              insideModal={true}
            />
          </Typography>

          <Divider/>
        </Box>
      </Modal>
    </div>
  );
}