import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore =await cookies();
  const token = cookieStore.get('idToken')?.value;
  
  console.log('Token:', token);
  
  if (!token) {
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