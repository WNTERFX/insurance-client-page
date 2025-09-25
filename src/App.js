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
import { SignInForm } from './SignInForm';
import InvalidAuthRoute from './AdminApp/ControllerAdmin/InvalidAuthRoute';


function App() {
  return (
    
  <Routes>
  <Route path="/appinsurance" element={<LandingPage />} />
  <Route path="/appinsurance/signin" element={<SignInForm />} />
  <Route path="/appinsurance/login" element={<LoginForm />} />

  {/* Protected routes */}
  <Route element={<InvalidAuthRoute />}>
    <Route path="/appinsurance/login/MainArea" element={<MainArea />}>
      <Route path="Home" element={<Home />} />
      <Route path="InsuranceDetails" element={<InsuranceDetails />} />
      <Route path="DueDates" element={<DueDates />} />
      <Route path="Balances" element={<Balances />} />
      <Route path="History" element={<History />} />
      <Route path="PendingPayments" element={<PendingPayments />} />
      <Route path="Claims" element={<Claims />} />
      <Route path="Quotation" element={<Quotation />} />
      <Route path="Payment" element={<Payment />} />
    </Route>
  </Route>

  <Route path="*" element={<div>Page not found</div>} />
</Routes>

    
    
  );
  
}
export default App;