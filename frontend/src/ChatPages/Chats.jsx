import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineDelete } from "react-icons/md";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./Chats.css";

const RAW_BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
const BASE_URL = (RAW_BASE || "").replace(/\/$/, "");

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasChats, setHasChats] = useState(false);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) return;

    setLoading(true);

    axios
      .get(`${BASE_URL}/chat/chats/${user._id}`)
      .then((response) => {
        setChats(response.data);
        setLoading(false);
        setHasChats(response.data.length > 0);
      })
      .catch((error) => {
        console.error("Error loading chats:", error);
        setLoading(false);
        setHasChats(false);
      });
  }, [user]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Issue Title", "Vehicle Number"]],
      body: chats.map((s) => [s.title, s.vehicle]),
      styles: { fontSize: 8 },
      theme: "grid",
    });
    doc.save("My Chats.pdf");
  };

  return (
    <div>
      <div className="Chats_parent">
        {user ? (
          <>
            <div>Welcome, {user.name}</div>
            <div
              className="CreateButton font-bold"
              onClick={() => navigate(`/chat/create`)}
            >
              Create
            </div>
            <button onClick={exportToPDF} className="Chats_DownloadPdf">
              Download PDF
            </button>
          </>
        ) : (
          <div className="LoginFirst_parent">
            <div className="LoginIfCantGetDetailsFromLocalStorage_parent">
              To create a chat, you must create an account first.
            </div>
            <div
              className="LoginIfCantGetDetailsFromLocalStorage"
              onClick={() => navigate(`/user/signin`)}
            >
              Login
            </div>
          </div>
        )}
      </div>

      <div className="Chats_parent2">
        {loading ? (
          <div>Loading...</div>
        ) : hasChats ? (
          chats.map((s) => (
            <div
              className="Chat"
              key={s._id}
              onClick={() => navigate(`/chat/getchat/${s._id}`)}
            >
              <div className="Chats_parent_middlepanel_title">
                Title: {s.title}
              </div>
              <div className="Chats_parent_middlepanel_vehicle">
                Vehicle Number: {s.vehicle}
              </div>
              <div className="Chats_parent_middlepanel_Operations">
                <Link className="delete" to={`/chat/delete/${s._id}`}>
                  <MdOutlineDelete />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div>No chats found.</div>
        )}
      </div>
    </div>
  );
};

export default Chats;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Spinner from "../components/Spinner";

// import { Link } from "react-router-dom";

// import { AiOutlineEdit } from "react-icons/ai";
// import { BsInfoCircle } from "react-icons/bs";
// import { MdOutlineAddBox, MdOutlineDelete } from "react-icons/md";
// import { useLocation } from "react-router-dom";

// import { useNavigate } from "react-router-dom";
// import "./Chats.css";
// import { jsPDF } from "jspdf";
// import "jspdf-autotable";

// const RAW_BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
// const BASE_URL = (RAW_BASE || "").replace(/\/$/, "");

// const Chats = () => {
//   const [chats, setS] = useState([]);
//   const [loading, setL] = useState(false);

//   //const [user, setU] = useState(localStorage.getItem("user"));
//   const [user, setU] = useState(() => {
//     const stored = localStorage.getItem("user");
//     try {
//       return stored ? JSON.parse(stored) : null;
//     } catch {
//       return null;
//     }
//   });

//   const [chatsloading, setChats] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     setL(true);
//     console.log(user);

//     const storedUser = localStorage.getItem("user");
//     let parsedUser = null;

//     try {
//       parsedUser = storedUser ? JSON.parse(storedUser) : null;
//     } catch (err) {
//       console.error("Failed to parse user from localStorage", err);
//     }

//     if (!parsedUser || !parsedUser._id) {
//       console.warn("No valid user found in localStorage");
//       setL(false);
//       setChats(false);
//       return;
//     }

//     axios
//       .get(`${BASE_URL}/chat/chats/${parsedUser._id}`)
//       .then((response) => {
//         setS(response.data);

//         setL(false);

//         if (response.data[0].title == "hi") {
//           setChats(true);
//         } else {
//           setChats(false);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//         setL(true);
//         setChats(false);
//       });
//   }, []);
//   const exportToPDF = () => {
//     const doc = new jsPDF();
//     doc.autoTable({
//       head: [["Issue title", "Vehicle number"]],
//       body: chats.map((s) => [s.title, s.vehicle]),
//       styles: { fontSize: 8 },
//       theme: "grid",
//     });
//     doc.save("My Chats.pdf");
//   };
//   return (
//     <div>
//       <div>
//         <div className="Chats_parent ">
//           <div>
//             {" "}
//             {user}
//             <br />
//           </div>
//         </div>
//       </div>
//       <div>
//         {!user ? (
//           <div className="LoginFirst_parent">
//             <div className="LoginIfCantGetDetailsFromLocalStorage_parent">
//               To create a chat, you must create an account first.
//             </div>
//             <div
//               className="LoginIfCantGetDetailsFromLocalStorage"
//               onClick={() => {
//                 navigate(`/user/signin`);
//               }}
//             >
//               Login
//             </div>
//           </div>
//         ) : (
//           <div className="Chats_parent ">
//             <div
//               className="CreateButton font-bold"
//               onClick={() => {
//                 navigate(`/chat/create`);
//               }}
//             >
//               Create
//             </div>
//             <div>
//               <button onClick={exportToPDF} className="Chats_DownloadPdf">
//                 Download PDF
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//       <div>
//         <div className="Chats_parent2 ">
//           {chatsloading ? (
//             <div></div>
//           ) : (
//             <div>
//               {chats.map(function (s, index) {
//                 return (
//                   <>
//                     <div
//                       className="Chat"
//                       key={s._id}
//                       onClick={() => {
//                         navigate(`/chat/getchat/${s._id}`);
//                       }}
//                     >
//                       <div className="Chats_parent_middlepanel_title text-black	">
//                         Title: {s.title}
//                       </div>
//                       <div className="Chats_parent_middlepanel_vehicle text-black	">
//                         Vehicle Number: {s.vehicle}
//                       </div>

//                       <div className="Chats_parent_middlepanel_Operations text-black	">
//                         {/* <Link className='info' to={`/chat/getchat/${s._id}`}>
//                                                 <BsInfoCircle className='' />
//                                             </Link> */}
//                         <Link className="delete" to={`/chat/delete/${s._id}`}>
//                           <MdOutlineDelete className="" />
//                         </Link>
//                       </div>
//                     </div>
//                   </>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chats;
