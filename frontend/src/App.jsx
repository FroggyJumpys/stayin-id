import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

// Feature-based imports (menggunakan index untuk import yang lebih clean)
import { Home } from './features/home';
import { Rooms } from './features/rooms';
import { Service } from './features/services';
import { About } from './features/about';
import { Login, Register, Protected } from './features/auth';
import { 
  Admin, 
  User, 
  AdminUser, 
  AdminKamar, 
  AdminService, 
  AdminRating, 
  UserSetting,
  UserBookings,
  UserOrders,
  UserRatings,
  Staff,
  StaffBookings,
  StaffOrders
} from './features/dashboard';
import NotFound from './features/NotFound';


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/about' element={<About />} />
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
      <Route path='/user/bookings' element={
        <Protected requiredRole='guest'>
          <UserBookings />
        </Protected>
        } />
      <Route path='/user/orders' element={
        <Protected requiredRole='guest'>
          <UserOrders />
        </Protected>
        } />
      <Route path='/user/ratings' element={
        <Protected requiredRole='guest'>
          <UserRatings />
        </Protected>
        } />
      <Route path='/staff' element={
        <Protected requiredRole='staff'>
          <Staff />
        </Protected>
        } />
      <Route path='/staff/bookings' element={
        <Protected requiredRole='staff'>
          <StaffBookings />
        </Protected>
        } />
      <Route path='/staff/orders' element={
        <Protected requiredRole='staff'>
          <StaffOrders />
        </Protected>
        } />
      <Route path='*' element={<NotFound />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
