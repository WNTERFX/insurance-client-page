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
import AccountSettings from './AccountSettings';
import MainArea from './MainArea';
import { SignInForm } from './SignInForm';
import InvalidAuthRoute from './AdminApp/ControllerAdmin/InvalidAuthRoute';
import ResetPasswordForm from "./ResetPasswordForm";
import { EmailVerified } from './EmailVerified'

import PaymentSuccess from './PaymentSuccess';
import PaymentFailure from './PaymentFailure';

import ClientClaimsCreationController from './ClientController/ClientClaimsCreationController';
import Partners from './Partners';
import AboutUs from './AboutUs';
import Contact from './Contact';
import CreateQuote from './CreateQuote';
import QuoteInfo from './QuoteInfo';
import FAQs from './FAQs';

import CalendarWrapper from './ClientForms/CalendarWrapper';

function App() {
  return (
    
  <Routes>
  <Route path="/insurance-client-page" element={<LandingPage />} />
  <Route path="/insurance-client-page/signin" element={<SignInForm />} />
  <Route path="/insurance-client-page/login" element={<LoginForm />} />
  <Route path="/insurance-client-page/reset-password" element={<ResetPasswordForm />} />
  <Route path="/insurance-client-page/email-verified" element={<EmailVerified />} />
  
  <Route path="/insurance-client-page/main-portal/payment/success" element={<PaymentSuccess />} />
  <Route path="/insurance-client-page/main-portal/payment/failure" element={<PaymentFailure />} />

  <Route path="/insurance-client-page/Partners" element={<Partners />} />
  <Route path="/insurance-client-page/AboutUs" element={<AboutUs />} />
  <Route path="/insurance-client-page/Contact" element={<Contact />} />
  <Route path="/insurance-client-page/CreateQuote" element={<CreateQuote />} />
  <Route path="/insurance-client-page/QuoteInfo" element={<QuoteInfo />} />
  <Route path="/insurance-client-page/FAQs" element={<FAQs />} />
  

   
  {/* Protected routes */}
  <Route element={<InvalidAuthRoute />}>

    <Route path="/insurance-client-page/main-portal" element={<MainArea />}>
      <Route path="Home" element={<Home />} />
      <Route path="Home/CalendarWrapper" element={<CalendarWrapper />} />
      <Route path="InsuranceDetails" element={<InsuranceDetails />} />
      <Route path="DueDates" element={<DueDates />} />
      <Route path="Balances" element={<Balances />} />
      <Route path="History" element={<History />} />
      <Route path="PendingPayments" element={<PendingPayments />} />
      <Route path="Claims" element={<Claims />} />
      <Route path="Claims/ClientClaimsCreationController" element={<ClientClaimsCreationController />} />
      <Route path ="Delivery" element={<Delivery/>} />
      <Route path="Quotation" element={<Quotation />} />
      <Route path="Payment" element={<Payment />} />
      <Route path ="AccountSettings" element={<AccountSettings/>} />
    </Route>
  </Route>

  <Route path="*" element={<div>Page not found</div>} />
</Routes>

    
    
  );
  
}
export default App;