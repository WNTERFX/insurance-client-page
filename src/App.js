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
import Delivery from './Delivery';
import Quotation from './Quotation';
import Payment from './Payment';
import MainArea from './MainArea';
import { SignInForm } from './SignInForm';
import InvalidAuthRoute from './AdminApp/ControllerAdmin/InvalidAuthRoute';
import ResetPasswordForm from "./ResetPasswordForm";

import PaymentSuccess from './PaymentSuccess';
import PaymentFailure from './PaymentFailure';

import ClientClaimsCreationController from './ClientController/ClientClaimsCreationController';


function App() {
  return (
    
  <Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/signin" element={<SignInForm />} />
  <Route path="/login" element={<LoginForm />} />
  <Route path="/reset-password" element={<ResetPasswordForm />} />
  <Route path="/main-portal/payment/success" element={<PaymentSuccess />} />
  <Route path="/main-portal/payment/failure" element={<PaymentFailure />} />

  <Route element={<InvalidAuthRoute />}>
    <Route path="/main-portal" element={<MainArea />}>
      <Route path="Home" element={<Home />} />
      <Route path="InsuranceDetails" element={<InsuranceDetails />} />
      <Route path="DueDates" element={<DueDates />} />
      <Route path="Balances" element={<Balances />} />
      <Route path="History" element={<History />} />
      <Route path="PendingPayments" element={<PendingPayments />} />
      <Route path="Claims" element={<Claims />} />
      <Route path="Claims/ClientClaimsCreationController" element={<ClientClaimsCreationController />} />
      <Route path="Delivery" element={<Delivery />} />
      <Route path="Quotation" element={<Quotation />} />
      <Route path="Payment" element={<Payment />} />
    </Route>
  </Route>

  <Route path="*" element={<div>Page not found</div>} />
</Routes>
    
    
  );
  
}
export default App;