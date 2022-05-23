import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Tooltip } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50vw',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  minWidth:'450px',
  maxWidth:'550px'
};

export default function AboutModal({aboutShow, setAboutShow}){
  const handleClose = () => setAboutShow(false);

  return (
    <div>
      <Modal
        open={aboutShow}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            About
            <Tooltip title="Close">
              <IconButton sx={{ p: '10px', float: 'right' }} aria-label="clear" onClick={handleClose}>
                <CloseIcon/>
              </IconButton>
            </Tooltip>
          </Typography>
          <Divider/>
          <Typography id="body2" variant="body2" component="p">
            Game Recommendation System
            <p>TechStack: Python, React, MongoDB</p>
            <p>Creator: Utkarsh Sharma</p>
            <p>(Still under development. Bugs are expected)</p>
          </Typography>
          <Divider/>

          <Tooltip title="Linkedin">
            <LinkedInIcon 
            sx={{cursor: 'pointer'}}
            onClick={
              ()=>{
                window.location = "https://www.linkedin.com/in/utkarsh-sharma-83883a216/";
              }
            }/>
          </Tooltip>
        </Box>
      </Modal>
    </div>
  );
}