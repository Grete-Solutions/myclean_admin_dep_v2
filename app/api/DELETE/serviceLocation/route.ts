import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function DELETE(
  request: NextRequest,
) {
  try {
    // Get token using the standard request
    const tokeninfo = await getToken({ req: request });
    const token = tokeninfo?.idToken;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
    console.log('Token:', token);
    
    if (!token) {
      return Response.json({ error: 'No token found' }, { status: 401 });
    }


    if (!id) {
      return Response.json(
        { error: 'Service location ID is required' },
        { status: 400 }
      );
    }

    console.log('Deleting service location with ID:', id);

    // Make request to your backend API
    const res = await fetch(`${process.env.URLB}/location/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Backend response status:', res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Backend delete error:', errorData);
      
      return Response.json(
        { 
          error: 'Failed to delete service location',
          details: errorData,
          status: res.status
        },
        { status: res.status }
      );
    }

    // Try to parse the response as JSON, fallback to success message
    let responseData;
    try {
      responseData = await res.json();
    } catch {
      responseData = { message: 'Service location deleted successfully' };
    }

    console.log('Delete successful:', responseData);

    return new Response(JSON.stringify({
      message: 'Service location deleted successfully',
      data: responseData
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    
    return Response.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}