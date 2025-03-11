import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';
/*************  ✨ Codeium Command ⭐  *************/
/******  9feb7fed-7092-4c0b-a77f-fb0ce1ebdb14  *******/
export async function GET(req: NextRequestWithAuth) {
  const tokeninfo = await getToken({ req });

  const token = tokeninfo?.idToken;
  
  console.log('Token:', token);
  
  if (!token) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }
  
  const res = await fetch(`${process.env.URLB}/users/get?status=approved`, {
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  const data = await res.json();
  console.log(data)
  return Response.json(data);
}