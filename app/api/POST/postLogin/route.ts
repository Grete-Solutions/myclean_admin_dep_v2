import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!process.env.URLB) {
      console.error("URLB environment variable is not defined");
      return NextResponse.json(
        { error: "Server configuration error" }, 
        { status: 500 }
      );
    }
    
    const response = await fetch(`${process.env.URLB}/admin/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`Backend returned ${response.status}: `, errorData);
      return NextResponse.json(
        { error: errorData || "Backend service error" }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error) {
    console.error('Error in auth API route:', error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}