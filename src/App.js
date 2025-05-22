import LoginForm from './LoginForm';
import LandingPage from './LandingPage';
import React from 'react';
import {Routes, Route} from "react-router-dom";
//import ClientMainArea from './Sidebar-client';
//import ClientMainArea from './Topbar-client'
import Home from './Home';
import InsuranceDetails from './InsuranceDetails';
import DueDates from './DueDates';
import Balances from './Balances';
import History from './History';
import PendingPayments from './PendingPayments';
import Claims from './Claims';
import Quotation from './Quotation';
import Payment from './Payment';
import MainArea from './MainArea';



function App() {
  return (
    
    <Routes>
      <Route path="/appinsurance" element={<LandingPage/> }/>
      <Route path="/appinsurance/login" element={<LoginForm/> }/>
    

      <Route path="/appinsurance/login/MainArea" element={<MainArea />}>
        <Route path="/appinsurance/login/MainArea/Home" element={<Home />} />
        <Route path="/appinsurance/login/MainArea/InsuranceDetails" element={<InsuranceDetails />} />
        <Route path="/appinsurance/login/MainArea/DueDates" element={<DueDates />} />
        <Route path="/appinsurance/login/MainArea/Balances" element={<Balances />} />
        <Route path="/appinsurance/login/MainArea/History" element={<History />} />
        <Route path="/appinsurance/login/MainArea/PendingPayments" element={<PendingPayments />} />
        <Route path="/appinsurance/login/MainArea/Claims" element={<Claims />} />
        <Route path="/appinsurance/login/MainArea/Quotation" element={<Quotation />} />
        <Route path="/appinsurance/login/MainArea/Payment" element={<Payment />} />


      </Route>

       

      
      <Route path="*" element={<div>Page not found</div>} />  
     

    </Routes>
    
  );
  
}
export default App;