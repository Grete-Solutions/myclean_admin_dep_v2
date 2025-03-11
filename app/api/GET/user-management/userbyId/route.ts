import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export async function GET(req: NextRequestWithAuth,request: Request) {
  const tokeninfo = await getToken({ req });

  const token = tokeninfo?.idToken;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
 
  
  console.log('Token:', token);
  
  if (!token) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }
  
    const res = await fetch(`${process.env.URLB}/users/get?id=${id}`, {
      cache: 'no-cache',  
      headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,

        },
    });
  
    const product = await res.json();
  
    return Response.json( product );
  }
  