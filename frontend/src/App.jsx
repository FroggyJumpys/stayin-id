import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Service from './pages/Service';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/dashboard/Admin';


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/rooms' element={<Rooms />}/>
      <Route path='/service' element={<Service />}/>
      <Route path='/login' element={<Login />}/>
      <Route path='/register' element={<Register />}/>
      <Route path='/admin' element={<Admin />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
