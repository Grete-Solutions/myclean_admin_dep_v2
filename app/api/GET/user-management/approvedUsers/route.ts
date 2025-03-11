import { cookies } from "next/headers";

export async function GET(){
    const cookieStore =await cookies();
    const token = cookieStore.get('idToken')?.value;
    
    console.log('Token:', token);
    
    if (!token) {
      return Response.json({ error: 'No token found' }, { status: 401 });
    }
    
    const res = await fetch(`${process.env.URL}/users/get?status=approved`, {
      cache: 'no-cache',  
      headers: {
            'Content-Type': 'application/json',
    
        },
    });
    const product = await res.json();
    console.log('Product:', product);
  
    return Response.json( {product} );
  }
  
