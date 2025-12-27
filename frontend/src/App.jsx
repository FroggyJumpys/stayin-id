import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

// Feature-based imports (menggunakan index untuk import yang lebih clean)
import { Home } from './features/home';
import { Rooms } from './features/rooms';
import { Service } from './features/services';
import { Login, Register, Protected } from './features/auth';
import { 
  Admin, 
  User, 
  AdminUser, 
  AdminKamar, 
  AdminService, 
  AdminRating, 
  UserSetting 
} from './features/dashboard';


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/rooms' element={<Rooms />}/>
      <Route path='/service' element={<Service />}/>
      <Route path='/login' element={<Login />}/>
      <Route path='/register' element={<Register />}/>
      <Route path='/admin' element={
        <Protected requiredRole='admin'>
          <Admin />
        </Protected>
        } />
      <Route path='/admin/user' element={
        <Protected requiredRole='admin'>
          <AdminUser />
        </Protected>
        } />
      <Route path='/admin/kamar' element={
        <Protected requiredRole='admin'>
          <AdminKamar />
        </Protected>
        } />
      <Route path='/admin/service' element={
        <Protected requiredRole='admin'>
          <AdminService />
        </Protected>
        } />
      <Route path='/admin/rating' element={
        <Protected requiredRole='admin'>
          <AdminRating />
        </Protected>
        } />
      <Route path='/user' element={
        <Protected requiredRole='guest'>
          <User />
        </Protected>
        } />
      <Route path='/user/setting' element={
        <Protected requiredRole='guest'>
          <UserSetting />
        </Protected>
        } />
    </Routes>
    </BrowserRouter>
  )
}

export default App
