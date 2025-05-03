import LoginForm from './LoginForm';
import {Routes, Route} from "react-router-dom";


function App() {
  return (
    
    <Routes>
      <Route path="/appinsurance" element={<LoginForm /> }/>
      
        <Route path="*" element={<div>Page not found</div>} />  
     

    </Routes>
    
  );
  
}
export default App;