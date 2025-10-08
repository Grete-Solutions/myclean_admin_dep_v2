import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const tokeninfo = await getToken({ req: request });
  const token = tokeninfo?.idToken||'eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1YTAwNWU5N2NiMWU0MjczMDBlNTJjZGQ1MGYwYjM2Y2Q4MDYyOWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbXljbGVhbi1hcHAiLCJhdWQiOiJteWNsZWFuLWFwcCIsImF1dGhfdGltZSI6MTc1OTkwODc2NCwidXNlcl9pZCI6Ik9QU1EzOFRYSjVUbHdCempCTnBUIiwic3ViIjoiT1BTUTM4VFhKNVRsd0J6akJOcFQiLCJpYXQiOjE3NTk5MDg3NjQsImV4cCI6MTc1OTkxMjM2NCwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJjdXN0b20ifX0.ItIDjmJgWV_tXJhmTEZJjjtaoSAYsWsTOUwnfJ7I2aiq-6ZpON4JPK3fQJPIQejJC3HEoXn29dnSzernM61_13MwmOslGptyPeqbFZmq6YHRjp8_sDkJIOX-a_xurOLI7EKN0-IBbxxpzOcxHHFxDj1P_Zxq4XFxzT4-B9u_Dl3bFK-115nfgt33v1A3qZeafGJ_uF5tkcTXJANOe-vj07CVERnoKLo5v2iZytu9j5AmW7jBpz1izTXbCtG2X2GrC5gzdkY0jjRDd5T4Esewp08efOnzx_HzfEYOJaYus8vb8OZMIF7rzeQWwaOaeJIYv0qe4GKSgeoAR9KgsUdCkg';

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!token) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }

  if (!userId) {
    return Response.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Fetch user details
    const userResponse = await fetch(`${process.env.URLB}/users/get?id=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user details');
    }

    const userData = await userResponse.json();
    console.log('User data response:', userData);

    // Fetch user pickups
    const pickupsResponse = await fetch(`${process.env.URLB}/booking/get?userId=${userId}&limit=10`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const pickupsData = pickupsResponse.ok ? await pickupsResponse.json() : { data: [] };
    console.log('Pickups data response:', pickupsData);

    // Fetch user payments
    const paymentsResponse = await fetch(`${process.env.URLB}/payment/get?userId=${userId}&limit=10`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const paymentsData = paymentsResponse.ok ? await paymentsResponse.json() : { data: [] };
    console.log('Payments data response:', paymentsData);

    return Response.json({
      success: true,
      data: {
        user: Array.isArray(userData.data) ? userData.data[0] : userData.data || userData,
        pickups: pickupsData.data || [],
        payments: paymentsData.data || [],
      },
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch user details',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}