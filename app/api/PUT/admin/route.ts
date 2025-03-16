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
        { message: 'Bad Request: Admin ID is required' },
        { status: 400 }
      );
    }

    // Extract data from request body
    const requestBody = await req.json();
    const { data } = requestBody; // The form data is wrapped in a 'data' object

    // Check if data exists
    if (!data) {
      return NextResponse.json(
        { message: 'Bad Request: No data provided' },
        { status: 400 }
      );
    }

    // Extract fields from data
    const {
      name,
      email,
      role,
      displayName,
      address,
      country,
      city,
      state,
      postalCode,
      phone,
    } = data;

    const response = await fetch(`${process.env.URLB}/admin/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        email,
        role,
        displayName,
        address,
        country,
        city,
        state,
        postalCode,
        phone,
      }),
    });
   
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to update admin' },
        { status: response.status }
      );
    }
   
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating admin:', error.message);
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