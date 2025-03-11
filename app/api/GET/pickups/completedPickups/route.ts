import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export async function GET(req: NextRequestWithAuth) {
  const tokeninfo = await getToken({ req });

  const token = tokeninfo?.idToken;

  
  console.log('Token:', token);
  
  if (!token) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }
  
  const res = await fetch(`${process.env.URL}/booking/get?status=completed`, {
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  const data = await res.json();
  return Response.json(data);
}