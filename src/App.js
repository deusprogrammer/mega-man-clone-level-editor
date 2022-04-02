import './App.css';
import {Route, Routes, BrowserRouter, Link, useLocation} from 'react-router-dom';

import Level from './routes/Level';
import TileSet from './routes/TileSet';

const App = () => {
    console.log("LOCATION: " + window.location.pathname);
    return (
        <div className="App">
            <BrowserRouter>
                <div className="navMenu">
                    <Link to="/tilesets">Tileset Editor</Link><Link to="/levels">Level Editor</Link>
                </div>
                <Routes>
                    <Route path="/tilesets" element={<TileSet />} />
                    <Route path="/levels" element={<Level />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
