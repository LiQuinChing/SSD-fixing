import React from "react";
import { GoogleLogin } from "@react-oauth/google";

export default function GoogleLoginButton({ onSuccess, onError }) {
  const handleSuccess = (credentialResponse) => {
    console.log("Google Login Success:", credentialResponse);
    // The credential is the JWT token from Google
    if (credentialResponse.credential) {
      onSuccess(credentialResponse.credential);
    } else {
      console.error("No credential received from Google");
      onError && onError("No credential received");
    }
  };

  const handleError = (error) => {
    console.error("Google Login Failed:", error);
    onError && onError(error);
  };

  return (
    <div className="google-login-container">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        auto_select={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="pill"
        locale="en"
        context="signin"
      />
    </div>
  );
}

// import { useEffect, useRef } from "react";

// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// export default function GoogleLoginButton({ onSuccess }) {
//   const divRef = useRef(null);

//   useEffect(() => {
//     //     if (!window.google || !GOOGLE_CLIENT_ID || !divRef.current) return;
//     console.log("location.origin =", location.origin);
//     console.log(
//       "VITE_GOOGLE_CLIENT_ID =",
//       import.meta.env.VITE_GOOGLE_CLIENT_ID
//     );

//     if (!window.google) {
//       console.error("GIS script not loaded");
//       return;
//     }
//     if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
//       console.error("Missing VITE_GOOGLE_CLIENT_ID");
//       return;
//     }

//     window.google.accounts.id.initialize({
//       client_id: GOOGLE_CLIENT_ID,
//       callback: (response) => {
//         // response.credential is the ID token
//         onSuccess?.(response.credential);
//       },
//       auto_select: false,
//       context: "use",
//     });

//     window.google.accounts.id.renderButton(divRef.current, {
//       theme: "outline",
//       size: "large",
//       type: "standard",
//       text: "continue_with",
//       shape: "pill",
//     });
//   }, []);

//   return <div ref={divRef} />;
// }
