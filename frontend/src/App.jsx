import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Service from './pages/Service';


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/rooms' element={<Rooms />}/>
      <Route path='/service' element={<Service />}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
