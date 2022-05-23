import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Alert, CircularProgress, Divider, IconButton } from '@mui/material';
import { Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Tooltip } from '@mui/material';
import { TextField } from '@mui/material';

import { useTransition, animated } from 'react-spring';

import "./loginmodal.css"
import { axiosInstance } from '../../config';

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
  minWidth:'400px',
  maxWidth:'550px'
};

export default function LoginModal({user, setUser, loginShow, setLoginShow}){
  const [login, setLogin] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const transition = useTransition(login, {
    enter: {x: 0, y:0, opacity: 1},
    leave:{x: 40, y: 0, opacity: 0, display: 'none'},
    from: {x: -40, y: 0, opacity: 0, display: 'flex'}
  })

    const username = useRef();
    const email = useRef();
    const password = useRef();
    const confirmPassword = useRef();

    const loginEmail = useRef();
    const loginPass = useRef();

    const handleRegister = async (e) =>{
        e.preventDefault();
        if(confirmPassword.current.value !== password.current.value){
            setError("Passwords don't match");
        }else if(username.current.value.length < 2){
          setError("Username must be at least 3 characters long");
        }else if(password.current.value.length < 6){
          setError("Password must be at least 6 characters long");
        }else{
            const user = {
                username: username.current.value,
                email: email.current.value,
                password: password.current.value,
            }
            try{
                setLoading(true);
                const res = await axiosInstance.post('/signup/', user);
                setUser(res.data);
                setError(null);
                handleClose();
            }catch(err){
                console.log(err);
                setError("User alreasy exists on this email");
            }finally{
              setLoading(false);
            }
        }
    }

    const handleLogin = async (e) =>{
      e.preventDefault();

      if(loginPass.current.value.length < 6){
        setError("Password must be at least 6 characters long");
      }else{
          const user = {
              email: loginEmail.current.value,
              password: loginPass.current.value,
          }
          try{
              setLoading(true);
              const res = await axiosInstance.post('/login/', user);
              setUser(res.data);
              setError(null);
              handleClose();
          }catch(err){
              console.log(err);
              setError("User not found")
          }finally{
            setLoading(false);
          }

      }
  }

  const handleClose = () => setLoginShow(false);

  return (
    <>
      <Modal
        open={loginShow}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Login / Signup
            <Tooltip title="Close">
              <IconButton sx={{ p: '10px', float: 'right' }} aria-label="clear" onClick={handleClose}>
                <CloseIcon/>
              </IconButton>
            </Tooltip>
          </Typography>

          {error?
          <Alert severity="error" sx={{width: '100%', mb: 1}}>{error}</Alert>
          :""
          }

          <Divider/>
          <Typography id="modal-modal-description" sx={{ mt: 2, maxHeight: '600px' }}>
            {transition((animstyle, item)=>
            item ?
            <animated.form className="form" style={animstyle}>
              <TextField
                label="Email"
                type="search"
                variant="filled"
                className='login-input'
                inputRef={loginEmail}
                required
              />
              <TextField
                label="Password"
                type="password"
                variant="filled"
                className='login-input'
                inputRef={loginPass}
                required
              />
              <Button variant="contained" sx={{mt: 2, mb: 2}} onClick={(e)=>{
                if(!loading){
                  handleLogin(e);
                }
              }}>
              {loading ? <CircularProgress/>:
                'Login'
              }
              </Button>

              <small>Not have an account?</small>
              <Button variant="contained" onClick={()=>{
                setLogin(prev=>!prev)
                setError(null);
              }}>
                Register
              </Button>
            </animated.form>:
            <animated.form className="form" style={animstyle}>
                <TextField
                  label="Username"
                  type="text"
                  variant="filled"
                  className='login-input'
                  inputRef={username}
                />
                <TextField
                  label="Email"
                  type="email"
                  variant="filled"
                  className='login-input'
                  inputRef={email}
                />
                <TextField
                  label="Password"
                  type="password"
                  variant="filled"
                  className='login-input'
                  inputRef={password}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  variant="filled"
                  className='login-input'
                  inputRef={confirmPassword}
                />
              <Button variant="contained" sx={{mt: 2, mb: 2}} onClick={(e)=>{
                if(!loading){
                  handleRegister(e);
                }
              }}>
                {loading ? <CircularProgress/>:
                  'Register'
                }
              </Button>

              <small>Already have an account?</small>
              <Button variant="contained"  onClick={()=>{
                  if(!loading){
                    setLogin(prev=>!prev);
                    setError(null);
                  }
                }}>
                {loading ? <CircularProgress/>:
                'Login'
                }
              </Button>
            </animated.form>
            )}
          </Typography>
          <Divider/>
          
        </Box>
      </Modal>
    </>
  );
}