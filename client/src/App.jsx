import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';
import IncomingRequests from './pages/IncomingRequests';
import MyRequests from './pages/MyRequests';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/incoming" element={<IncomingRequests />} />
        <Route path="/my-requests" element={<MyRequests />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;