import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';
// import { cookies } from 'next/headers';

export async function GET(req: NextRequestWithAuth) {
  const tokeninfo = await getToken({ req });

  const token = tokeninfo?.idToken;


  
  console.log('Token:', token);
  
  if (!tokeninfo) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }
  
  const res = await fetch(`${process.env.URL}/admin/get?from=2024-09-01&to=2025-09-30`, {
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  const admin = await res.json();
  return Response.json(admin);
}