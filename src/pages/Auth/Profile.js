import React, { useEffect, useState } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../constants/constants";
import { lightTheme } from "../../styles/light";
import UserInfo from "../../components/auth/UserInfo";
import ProfileForm from "./ProfileForm";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    password_confirmation: "",
    image: null,
  });

  const token = localStorage.getItem("token");

  // جلب بيانات الملف الشخصي
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);
      setFormData((prev) => ({ ...prev, name: data.name }));
    } catch (err) {
      toast.error("Failed to fetch profile data");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "image" && files.length > 0) {
    console.log("📂 Selected image file:", files[0]);
  }

  setFormData((prev) => ({
    ...prev,
    [name]: name === "image" ? files[0] : value,
  }));
};


  const getProfileImage = () => {
  if (formData.image) {
    const previewUrl = URL.createObjectURL(formData.image);
    console.log("📸 Preview Image:", previewUrl);
    return previewUrl;
  }

  if (profile?.img_url) {
    console.log("🗂 Raw image from DB:", profile.img_url);

    let cleanPath = profile.img_url.trim(); // لا تحذف %20
    const fullPath = cleanPath.startsWith("http")
      ? cleanPath
      : `${API_BASE_URL}/${cleanPath}`;

    console.log("🌐 Full image path:", fullPath);
    return fullPath;
  }

  console.log("⚠️ No image found, using default avatar");
  return "/assets/img/default-avatar.png";
};



  // تحديث الملف الشخصي
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("name", formData.name);
      if (formData.password) form.append("password", formData.password);
      if (formData.password_confirmation)
        form.append("password_confirmation", formData.password_confirmation);
      if (formData.image) form.append("image", formData.image);

      const res = await fetch(`${API_BASE_URL}/api/updateMyProfile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        await fetchProfile();
        setIsEditing(false);
        setFormData({
          name: "",
          password: "",
          password_confirmation: "",
          image: null,
        });
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred while updating");
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p
          className="text-lg animate-pulse"
          style={{ color: lightTheme["--color-text-muted"] }}
        >
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(to bottom right, ${lightTheme["--color-surface"]}, ${lightTheme["--color-bg"]})`,
      }}
    >
      <div
        className="rounded-2xl p-6 sm:p-8 w-full max-w-md md:max-w-2xl lg:max-w-3xl relative overflow-hidden shadow-2xl"
        style={{
          background: lightTheme["--color-bg"],
          color: lightTheme["--color-text-main"],
        }}
      >
        {/* زر التعديل */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors duration-300"
          style={{
            background: lightTheme["--color-primary"],
            color: lightTheme["--color-white"],
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = lightTheme["--color-primary-hover"])
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = lightTheme["--color-primary"])
          }
        >
          {isEditing ? <FaTimes /> : <FaEdit />}
        </button>

        {/* صورة + اسم */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 relative z-10">
          <img
            src={formData.image ? URL.createObjectURL(formData.image) : getProfileImage()}
            alt={profile.name}
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-4 shadow-lg"
            style={{ borderColor: lightTheme["--color-primary"] }}
          />

          {isEditing ? (
            <ProfileForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
            />
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4">
                {profile.name}
              </h2>
              <p
                className="font-semibold flex items-center gap-2 mt-1"
                style={{ color: lightTheme["--color-secondary"] }}
              >
                {profile.position}
              </p>
            </>
          )}
        </div>

        {!isEditing && <UserInfo profile={profile} lightTheme={lightTheme} />}
      </div>
    </div>
  );
};

export default Profile;
