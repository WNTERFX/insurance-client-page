import LoginForm from './LoginForm';
import LandingPage from './LandingPage';
import React from 'react';
import {Routes, Route} from "react-router-dom";
import ClientMainArea from './ClientMainArea';


function App() {
  return (
    
    <Routes>
      <Route path="/appinsurance" element={<LandingPage/> }/>
      <Route path="/appinsurance/login" element={<LoginForm/> }/>
      <Route path="/appinsurance/login/ClientMainArea" element={<ClientMainArea/> }/>
      
      <Route path="*" element={<div>Page not found</div>} />  
     

    </Routes>
    
  );
  
}
export default App;