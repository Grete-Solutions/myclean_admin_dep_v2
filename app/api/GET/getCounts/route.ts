import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// Define more specific types for the driver object
interface Driver {
  id: string;
  country?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  status?: string;
  userType?: number;
  balance?: number;
  availability?: boolean;
  // Add other specific properties as needed
}

// Define payment interface
interface Payment {
  id: string;
  userId: string;
  reference: string;
  amount: string;
  status: string;
  customermsisdn: string;
  channel: string;
  paymentMethod: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface ApiResponse<T> {
  count?: number;
  data?: T[];
}

export async function GET(request: NextRequest) {
  // Get token using the standard request
  const tokeninfo = await getToken({ req: request });
  const token = tokeninfo?.idToken;
  
  console.log('Token:', token);
  
  if (!token) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }
  
  try {
    // Fetch approved users
    const approvedUsersResponse = await fetch(`${process.env.URLB}/users/get?status=approved`, {
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Fetch drivers (userType=2)
    const driversResponse = await fetch(`${process.env.URLB}/users/get?userType=2&limit=20`, {
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Fetch payments
    const paymentsResponse = await fetch(`${process.env.URLB}/payment/get?limit=50&from=2025-01-01&to=2025-03-18`, {
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Parse responses
    const approvedUsersData = await approvedUsersResponse.json() as ApiResponse<Driver>;
    const driversData = await driversResponse.json() as ApiResponse<Driver>;
    const paymentsData = await paymentsResponse.json() as ApiResponse<Payment>;
    
    // Calculate total driver balance
    const drivers = driversData.data || [];
    const totalDriverBalance = drivers.reduce((total: number, driver: Driver) => {
      // Use balance if it exists, otherwise default to 0
      const driverBalance = typeof driver.balance === 'number' ? driver.balance : 0;
      return total + driverBalance;
    }, 0);
    
    // Process payment data
    const payments = paymentsData.data || [];
    
    // Calculate total amount of completed payments
    const completedPayments = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    // Calculate total amount of pending payments
    const pendingPayments = payments
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    // Calculate total monthly payments (all statuses)
    const totalMonthlyPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    // Extract counts and combine data
    const result = {
      counts: {
        approvedUsers: approvedUsersData.count || 0,
        drivers: driversData.count || 0,
        totalUsers: (approvedUsersData.count || 0) + (driversData.count || 0),
        totalDriverBalance: totalDriverBalance,
        completedPayments: completedPayments,
        pendingPayments: pendingPayments,
        totalMonthlyPayments: totalMonthlyPayments
      },
      approvedUsers: approvedUsersData.data || [],
      drivers: driversData.data || [],
      payments: paymentsData.data || []
    };
    
    console.log('Combined data:', result);
    return Response.json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}