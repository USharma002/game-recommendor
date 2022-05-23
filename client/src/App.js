import Home from "./pages/Homepage/Home";
import { CssBaseline } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:{
      main: '#6605ed'
    }
  }
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary:{
      main: '#6605ed'
    }
  },
});

function App() {
  const [theme, setTheme] = useState('dark');

  return (
    <ThemeProvider theme={theme==='dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route exact path='/' element={<Home theme={theme} setTheme={setTheme}/> } />
          <Route exact path="/home" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
