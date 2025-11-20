import LoginForm from './LoginForm';
import LandingPage from './LandingPage';
import React from 'react';
import {Routes, Route} from "react-router-dom";
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
import { SignUpForm } from './SignUpForm';
import InvalidAuthRoute from './AdminApp/ControllerAdmin/InvalidAuthRoute';
import ResetPasswordForm from "./ResetPasswordForm";
import { EmailVerified } from './EmailVerified'
import SessionExpiredPage from './SessionExpiredPage'; // ✅ Import new component

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

import ProfilePage from './ProfilePage';

import TermsAndConditions from './TermsAndConditions';
import PrivacyPolicy from './PrivacyPolicy';
import About from './About';

import GlobalAlert from './ReusableComponents/GlobalAlert';

function App() {
  return (
    <>
      <GlobalAlert />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/insurance-client-page/signup" element={<SignUpForm />} />
        <Route path="/insurance-client-page/login" element={<LoginForm />} />
        <Route path="/insurance-client-page/reset-password" element={<ResetPasswordForm />} />
        <Route path="/insurance-client-page/email-verified" element={<EmailVerified />} />
        <Route path="/insurance-client-page/session-expired" element={<SessionExpiredPage />} /> {/* ✅ New route */}
        
        <Route path="/insurance-client-page/main-portal/payment/success" element={<PaymentSuccess />} />
        <Route path="/insurance-client-page/main-portal/payment/failure" element={<PaymentFailure />} />

        <Route path="/insurance-client-page/Partners" element={<Partners />} />
        <Route path="/insurance-client-page/AboutUs" element={<AboutUs />} />
        <Route path="/insurance-client-page/Contact" element={<Contact />} />
        <Route path="/insurance-client-page/CreateQuote" element={<CreateQuote />} />
        <Route path="/insurance-client-page/QuoteInfo" element={<QuoteInfo />} />
        <Route path="/insurance-client-page/FAQs" element={<FAQs />} />
        <Route path="/insurance-client-page/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/insurance-client-page/TermsAndConditions" element={<TermsAndConditions />} />

        {/* Protected routes */}
        <Route element={<InvalidAuthRoute />}>
          <Route path="/insurance-client-page/main-portal" element={<MainArea />}>
            <Route index element={<Home />} />
            <Route path="Home" element={<Home />} />
            <Route path="Home/CalendarWrapper" element={<CalendarWrapper />} />
            <Route path="InsuranceDetails" element={<InsuranceDetails />} />
            <Route path="DueDates" element={<DueDates />} />
            <Route path="Balances" element={<Balances />} />
            <Route path="History" element={<History />} />
            <Route path="PendingPayments" element={<PendingPayments />} />
            <Route path="Claims" element={<Claims />} />
            <Route path="Claims/ClientClaimsCreationController" element={<ClientClaimsCreationController />} />
            <Route path="Delivery" element={<Delivery/>} />
            <Route path="Quotation" element={<Quotation />} />
            <Route path="Payment" element={<Payment />} />
            <Route path="AccountSettings" element={<AccountSettings/>} />
            <Route path="Profile" element={<ProfilePage/>} />
            <Route path="About" element={<About/>} />
          </Route>
        </Route>

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </>
  );
}

export default App;