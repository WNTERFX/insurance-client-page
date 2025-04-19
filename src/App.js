import LoginForm from './LoginForm';
import MainArea from './MainArea';
import {Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/appinsurance" element={<LoginForm /> }/>
      <Route path="/appinsurance/MainArea" element={<MainArea /> }/>
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
  
   
}

export default App;
