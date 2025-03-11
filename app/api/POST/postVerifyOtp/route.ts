import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse the request body to get email and OTP
    const { email, otp } = await req.json();
    console.log('Email:', email);
    console.log('OTP:', otp);

    // Make the OTP verification request to your backend
    const response = await fetch(`${process.env.URLB}/admin/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    console.log('Backend response:', data); // Debug log
    
    if (!response.ok) {
      throw new Error(`Backend error: ${data.message || 'Unknown error'}`);
    }

    // Check for customToken in the correct location
    const customToken = data.data?.customToken || data.customToken;
    
    if (customToken) {
      console.log('Custom token found:', customToken);
      
      // Use the customToken to get an idToken
      const firebaseResponse = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyBviqkGOjkcOKF5ih6aho9s_EHNeF9eR7I",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: customToken, returnSecureToken: true }),
        }
      );

      const firebaseData = await firebaseResponse.json();
      console.log('Firebase response:', firebaseData); // Debug log

      if (!firebaseResponse.ok) {
        throw new Error(`Firebase auth error: ${firebaseData.error?.message || "Authentication failed"}`);
      }

      // Extract the idToken and refreshToken from firebaseData
      const { idToken, refreshToken } = firebaseData;
      console.log("✅ Storing Tokens:", { idToken, refreshToken });

      // Create a new response
      const response = NextResponse.json({
        success: true,
        message: "OTP verification successful",
        idToken,
        refreshToken
      });
      
      // Set HTTP-Only Secure Cookies for both tokens
      response.cookies.set({
        name: "authToken",
        value: idToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
      });
      
      response.cookies.set({
        name: "refreshToken",
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", 
        path: "/"
      });
      
      console.log("✅ Cookies Set:", response.cookies);
      
      return response;
    } else {
      console.log('No custom token found in response');
      return NextResponse.json({
        success: false,
        message: "Authentication failed: No custom token provided"
      }, { status: 400 });
    }
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'An unknown error occurred' 
      }, { status: 500 });
    }
  }
}