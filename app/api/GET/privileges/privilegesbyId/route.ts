import { cookies } from 'next/headers';

export async function GET(request:Request) {
  const cookieStore =await cookies();
  const token = cookieStore.get('idToken')?.value;
  
  console.log('Token:', token);
  
  if (!token) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const res = await fetch(`${process.env.URL}/privileges/get?id=${id}`, {
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, 
    },
  });

  const product = await res.json();
  console.log('Product:', product); // Log product to check if it's retrieved successfully
  return Response.json( product );
}
