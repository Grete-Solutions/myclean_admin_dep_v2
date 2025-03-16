import { NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get the authentication token
    const tokenInfo = await getToken({ req });
    const token = tokenInfo?.idToken;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }
    
    const {
      make,
      model,
      year,
      capacity,
      description
    } = await req.json();
    
    const response = await fetch(`${process.env.URLB}/api/vehicle-makes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        make,
        model,
        year,
        capacity,
        description
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to create vehicle make' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating vehicle make:', error.message);
      return NextResponse.json(
        { message: error.message }, 
        { status: 500 }
      );
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json(
        { message: 'An unexpected error occurred' }, 
        { status: 500 }
      );
    }
  }
}