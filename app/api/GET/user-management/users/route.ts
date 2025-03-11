import { cookies } from "next/headers";

export async function GET() {
  const cookieStore =await cookies();
  const token = cookieStore.get('idToken')?.value;
  
  console.log('Token:', token);
  
  if (!token) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }
  
    const res = await fetch(`${process.env.URL}/users/get?limit=500`, {
      cache: 'no-cache',  
      headers: {
            'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,

        },
    });
  
    const product = await res.json();
  
    return Response.json( product );
  }
  