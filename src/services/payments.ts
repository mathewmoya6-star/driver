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
    const { data: payment, error } = await supabase      .from('payments')
      .insert([{
        user_id: userId,
        enrollment_id: enrollmentId,
        amount,
        currency: 'KES',
        payment_method: 'mpesa',
        payment_reference: data.CheckoutRequestID,
        status: 'pending',
      }])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    return {
      paymentId: payment.id,
      checkoutRequestId: data.CheckoutRequestID,
    };
  },
  
  async checkPaymentStatus(paymentId: string): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();
    
    if (error) throw new Error(error.message);
    return data as Payment;
  },
  
  async getUserPayments(userId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*, enrollment:enrollments(course:courses(title))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data as Payment[];
  },
};
