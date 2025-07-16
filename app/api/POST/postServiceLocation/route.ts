import { NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// Define the bin type interface
interface BinType {
  binType: string;
  capacity: number;
  price: number;
  equivalentBags: string;
  isActive: boolean;
  imageUrl: string;
}

// Define the interface for the service location data
interface ServiceLocationData {
  city: string;
  price: number;
  isActive: boolean;
  countryISOCode: string;
  commission: number;
  coordinates: [number, number][];
  bins: BinType[];
  radius: number;
}

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
      city,
      price,
      isActive,
      countryISOCode,
      commission,
      coordinates,
      bins,
      radius
    }: ServiceLocationData = await req.json();
    
    // Validate required fields
    if (!city || !countryISOCode || !coordinates || !bins || !Array.isArray(bins) || bins.length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields: city, countryISOCode, coordinates, and bins are required' },
        { status: 400 }
      );
    }
    
    // Validate coordinates array
    if (!Array.isArray(coordinates) || coordinates.length < 3) {
      return NextResponse.json(
        { message: 'Coordinates must be an array with at least 3 points' },
        { status: 400 }
      );
    }
    
    // Validate coordinate format
    const isValidCoordinates = coordinates.every(coord => 
      Array.isArray(coord) && 
      coord.length === 2 && 
      typeof coord[0] === 'number' && 
      typeof coord[1] === 'number'
    );
    
    if (!isValidCoordinates) {
      return NextResponse.json(
        { message: 'Invalid coordinate format. Each coordinate must be [latitude, longitude]' },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { message: 'Price must be a non-negative number' },
        { status: 400 }
      );
    }
    
    if (typeof commission !== 'number' || commission < 0 || commission > 100) {
      return NextResponse.json(
        { message: 'Commission must be a number between 0 and 100' },
        { status: 400 }
      );
    }
    
    if (typeof radius !== 'number' || radius < 0) {
      return NextResponse.json(
        { message: 'Radius must be a non-negative number' },
        { status: 400 }
      );
    }
    
    // Validate boolean field
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { message: 'isActive must be a boolean value' },
        { status: 400 }
      );
    }
    
    // Validate bins array
    if (!Array.isArray(bins) || bins.length === 0) {
      return NextResponse.json(
        { message: 'Bins must be a non-empty array' },
        { status: 400 }
      );
    }
    
    // Validate each bin object
    for (const bin of bins) {
      if (!bin || typeof bin !== 'object') {
        return NextResponse.json(
          { message: 'Each bin must be an object' },
          { status: 400 }
        );
      }
      
      const requiredBinFields = ['binType', 'capacity', 'price', 'equivalentBags', 'isActive', 'imageUrl'];
      for (const field of requiredBinFields) {
        if (!(field in bin)) {
          return NextResponse.json(
            { message: `Missing required bin field: ${field}` },
            { status: 400 }
          );
        }
      }
      
      if (typeof bin.binType !== 'string' || bin.binType.trim().length === 0) {
        return NextResponse.json(
          { message: 'bin.binType must be a non-empty string' },
          { status: 400 }
        );
      }
      
      if (typeof bin.capacity !== 'number' || bin.capacity < 0) {
        return NextResponse.json(
          { message: 'bin.capacity must be a non-negative number' },
          { status: 400 }
        );
      }
      
      if (typeof bin.price !== 'number' || bin.price < 0) {
        return NextResponse.json(
          { message: 'bin.price must be a non-negative number' },
          { status: 400 }
        );
      }
      
      if (typeof bin.isActive !== 'boolean') {
        return NextResponse.json(
          { message: 'bin.isActive must be a boolean' },
          { status: 400 }
        );
      }
      
      if (typeof bin.equivalentBags !== 'string') {
        return NextResponse.json(
          { message: 'bin.equivalentBags must be a string' },
          { status: 400 }
        );
      }
      
      if (typeof bin.imageUrl !== 'string') {
        return NextResponse.json(
          { message: 'bin.imageUrl must be a string' },
          { status: 400 }
        );
      }
    }
    
    console.log('Sending request to backend:', {
      url: `${process.env.URLB}/location/create`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'No token'}`
      },
      body: { 
        city,
        price,
        isActive,
        countryISOCode,
        commission,
        coordinates,
        bins,
        radius
      }
    });
    
    // Log the actual coordinate structure
    console.log('Coordinates structure:', JSON.stringify(coordinates, null, 2));
    console.log('Coordinates length:', coordinates.length);
    console.log('First coordinate:', coordinates[0]);
    console.log('Coordinate types:', coordinates.map(coord => typeof coord));
    
    // Log the full request body as it will be sent
    const requestBody = { 
      city,
      price,
      isActive,
      countryISOCode,
      commission,
      coordinates,
      bins,
      radius
    };
    console.log('Full request body (JSON):', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${process.env.URLB}/location/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        city,
        price,
        isActive,
        countryISOCode,
        commission,
        coordinates,
        bins,
        radius
      }),
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch  {
        // If response is not JSON, get text
        const errorText = await response.text();
        console.error('Backend error (non-JSON):', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        return NextResponse.json(
          { 
            message: 'Failed to create service location',
            error: errorText,
            status: response.status,
            statusText: response.statusText
          }, 
          { status: response.status }
        );
      }
      
      console.error('Backend error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      return NextResponse.json(
        { 
          message: errorData.message || 'Failed to create service location',
          error: errorData,
          status: response.status,
          statusText: response.statusText
        }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Catch block error:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name
    });
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          message: error.message,
          error: error.message,
          stack: error.stack,
          type: 'Error'
        }, 
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { 
          message: 'An unexpected error occurred',
          error: String(error),
          type: 'Unknown'
        }, 
        { status: 500 }
      );
    }
  }
}