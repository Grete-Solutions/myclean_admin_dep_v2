import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const {
        name,
        password,
        email,
        role,
        address,
        country,
        state,
        postalCode,
        phone,
        city
      } = await req.json();
      const response = await fetch(`${process.env.URL}/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name,
          password,
          email,
          role,
          address,
          country,
          state,
          postalCode,
          phone,
        city}),
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