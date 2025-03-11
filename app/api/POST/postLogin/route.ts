import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const {email,password} = await req.json();
      const response = await fetch(`${process.env.URL}/admin/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email,password}),
      });
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        // Now you can safely use error.message, etc.
      } else {
        console.error('Unknown error:', error);
      }
    }
}
}