"use client";

import { useRouter } from "next/navigation";
import { FiUser, FiLock, FiStar } from "react-icons/fi";

export default function ProfileOptions() {
  const router = useRouter();

  const boxes = [
    {
      title: "Update Profile",
      desc: "Edit your personal information",
      icon: <FiUser className="text-3xl text-blue-600" />,
      path: "/profile/updateprofile",
    },
    {
      title: "Change Password",
      desc: "Secure your account",
      icon: <FiLock className="text-3xl text-green-600" />,
      path: "/profile/changepassword",
    },
    {
      title: "Saved Customized Services",
      desc: "View and manage saved services",
      icon: <FiStar className="text-3xl text-yellow-500" />,
      path: "/custom-service/saved",
    },
    {
      title: "My Bookings",
      desc: "View and manage My Bookings",
      icon: <FiStar className="text-3xl text-yellow-500" />,
      path: "profile/my-booking",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Profile Settings
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {boxes.map((box, i) => (
            <div
              key={i}
              onClick={() => router.push(box.path)}
              className="cursor-pointer bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl 
                         p-6 border border-white/40 hover:scale-105 transition-all hover:shadow-xl
                         flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-white flex items-center justify-center rounded-full shadow-md mb-4">
                {box.icon}
              </div>

              <h2 className="text-xl font-semibold text-gray-800">
                {box.title}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{box.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
