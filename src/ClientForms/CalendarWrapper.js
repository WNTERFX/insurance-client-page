import React, { useState, useEffect, useCallback } from 'react';
import CalendarMonth from './CalendarMonth';
import { fetchPoliciesWithComputation } from '../Actions/PolicyActions';
import { fetchPayments } from '../Actions/BalanceActions';

export default function CalendarWrapper() {
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcomingPayments = useCallback(async () => {
    setLoading(true);
    try {
      const policies = await fetchPoliciesWithComputation();
      if (policies && policies.length > 0) {
        const allUpcoming = [];
        
        for (const policy of policies) {
          const payments = await fetchPayments(policy.id);
          const pendingPayments = payments.filter(p => !p.is_paid);
          
          pendingPayments.forEach(payment => {
            allUpcoming.push({
              policyNumber: policy.internal_id,
              amount: payment.amount_to_be_paid,
              date: payment.payment_date,
              policyId: policy.id,
              paymentId: payment.id
            });
          });
        }
        
        // Sort by date
        allUpcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
        setUpcomingPayments(allUpcoming);
      } else {
        setUpcomingPayments([]);
      }
    } catch (error) {
      console.error("Error loading upcoming payments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingPayments();
  }, [fetchUpcomingPayments]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#F2F5FA'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return <CalendarMonth upcomingPayments={upcomingPayments} />;
}