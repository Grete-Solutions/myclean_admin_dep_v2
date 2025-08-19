import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// Type definitions
interface Driver {
  id: string;
  balance: number;
  name?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Payment {
  id: string;
  status:string;
  amount: string | number;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  description?: string;
}

interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  userType?: number;
}

interface ApiResponse<T> {
  data: T[];
  count: number;
}

export async function GET(request: NextRequest) {
  // Get token using the standard request
  const tokeninfo = await getToken({ req: request });
  const token = tokeninfo?.idToken;

  console.log('Token:', token);

  if (!token) {
    return Response.json({ error: 'Unauthorized: No token found' }, { status: 401 });
  }

  try {
    // Validate environment variable
    if (!process.env.URLB) {
      console.error('Environment variable URLB is not defined');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Fetch approved users
    const approvedUsersResponse = await fetch(`${process.env.URLB}/users/get?limit=500&from=2024-01-01`, {
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!approvedUsersResponse.ok) {
      throw new Error(`Failed to fetch approved users: ${approvedUsersResponse.statusText}`);
    }

    // Fetch drivers (userType=2)
    const driversResponse = await fetch(`${process.env.URLB}/users/get?userType=2&limit=500`, {
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!driversResponse.ok) {
      throw new Error(`Failed to fetch drivers: ${driversResponse.statusText}`);
    }

    // Fetch payments
    const paymentsResponse = await fetch(`${process.env.URLB}/payment/get?limit=500`, {
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!paymentsResponse.ok) {
      throw new Error(`Failed to fetch payments: ${paymentsResponse.statusText}`);
    }

    // Parse responses with proper typing
    const approvedUsersData: ApiResponse<User> = await approvedUsersResponse.json();
    const driversData: ApiResponse<Driver> = await driversResponse.json();
    const paymentsData: ApiResponse<Payment> = await paymentsResponse.json();

    // Validate response data
    if (!approvedUsersData || !driversData || !paymentsData) {
      throw new Error('Invalid response data from one or more API endpoints');
    }
    
    // Calculate total driver balance with proper typing
    const drivers = driversData.data || [];
    const totalDriverBalance = drivers.reduce((total: number, driver: Driver) => {
      const driverBalance = typeof driver.balance === 'number' && !isNaN(driver.balance) ? driver.balance : 0;
      return total + driverBalance;
    }, 0);

    // Process payment data
    const payments = paymentsData.data || [];

    // Calculate total amount of completed payments
    const completedPayments = payments
      .filter((payment: Payment) => payment?.status === 'paid' && payment?.amount)
      .reduce((sum: number, payment: Payment) => sum + (parseFloat(payment.amount.toString()) || 0), 0);

    // Calculate total amount of pending payments
    const pendingPayments = payments
      .filter((payment: Payment) => payment?.status === 'pending' && payment?.amount)
      .reduce((sum: number, payment: Payment) => sum + (parseFloat(payment.amount.toString()) || 0), 0);

    // Calculate total monthly payments (all statuses)
    const totalMonthlyPayments = payments
      .filter((payment: Payment) => payment?.amount)
      .reduce((sum: number, payment: Payment) => sum + (parseFloat(payment.amount.toString()) || 0), 0);

    // Extract counts and combine data
    const result = {
      counts: {
        approvedUsers: approvedUsersData.count || 0,
        drivers: driversData.count || 0,
        totalUsers: (approvedUsersData.count || 0) + (driversData.count || 0),
        totalDriverBalance,
        completedPayments,
        pendingPayments,
        totalMonthlyPayments,
      },
      approvedUsers: approvedUsersData.data || [],
      drivers: driversData.data || [],
      payments: paymentsData.data || [],
    };

    console.log('Combined data:', result);
    return Response.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching data:', errorMessage);
    return Response.json({ error: 'Failed to fetch data', details: errorMessage }, { status: 500 });
  }
}