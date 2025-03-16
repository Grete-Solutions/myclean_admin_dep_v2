import { NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function PUT(req: NextRequest) {
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
   
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'Bad Request: Vehicle ID is required' },
        { status: 400 }
      );
    }

    // Extract data from request body
    const vehicleData = await req.json();
    
    // Check if data exists
    if (!vehicleData) {
      return NextResponse.json(
        { message: 'Bad Request: No data provided' },
        { status: 400 }
      );
    }

    // Extract fields from data
    const {
      make,
      model,
      year,
      description,
      status,
      capacity
    } = vehicleData;

    const response = await fetch(`${process.env.URLB}/vehicleMake/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        make,
        model,
        year,
        description,
        status,
        capacity
      }),
    });
   
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to update vehicle make' },
        { status: response.status }
      );
    }
   
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating vehicle make:', error.message);
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