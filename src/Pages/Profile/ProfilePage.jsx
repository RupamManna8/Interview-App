import React, { useContext } from "react";
import { UserContext } from "../../Context/UserContext";

const ProfilePage = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
      <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Profile Settings</h2>
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center text-2xl font-medium">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#1F2937]">{user?.name || "User"}</h3>
            <p className="text-sm text-[#6B7280]">{user?.role || "Student"}</p>
            <p className="text-sm text-[#6B7280]">{user?.email || "user@example.com"}</p>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] pt-6">
          <p className="text-[#6B7280]">Profile settings coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
