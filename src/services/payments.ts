import { supabase } from './supabase';
import type { Payment } from '../types';

export const paymentService = {
  async initializeMpesaPayment(
    userId: string,
    enrollmentId: string,
    amount: number,
    phoneNumber: string
  ): Promise<{ paymentId: string; checkoutRequestId: string }> {
    // Call your backend webhook or edge function
    const response = await fetch(`${import.meta.env.VITE_API_URL}/mpesa/stkpush`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        enrollmentId,
        amount,
        phoneNumber,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || 'Payment initialization failed');
    
    // Create payment record
    const { data: payment, error } = await supabase
