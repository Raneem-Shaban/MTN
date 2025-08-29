import React, { useState } from "react";
import { FaSave } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import InputField from "../../components/auth/InputField";
import { lightTheme } from "../../styles/light";

const ProfileForm = ({ formData, handleChange, handleSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 sm:mt-6 w-full max-w-md sm:max-w-lg space-y-4"
    >
      {/* الاسم */}
      <InputField
        label="Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        lightTheme={lightTheme}
      />

      {/* كلمة المرور */}
      <div>
        <label
          className="block text-sm font-medium"
          style={{ color: lightTheme["--color-text-main"] }}
        >
          Password
        </label>
        <div className="relative mt-1">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 pr-10"
            style={{
              borderColor: lightTheme["--color-border"],
              background: lightTheme["--color-surface"],
              color: lightTheme["--color-text-main"],
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      {/* تأكيد كلمة المرور */}
      <div>
        <label
          className="block text-sm font-medium"
          style={{ color: lightTheme["--color-text-main"] }}
        >
          Confirm Password
        </label>
        <div className="relative mt-1">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 pr-10"
            style={{
              borderColor: lightTheme["--color-border"],
              background: lightTheme["--color-surface"],
              color: lightTheme["--color-text-main"],
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      {/* رفع الصورة */}
      <div className="flex flex-col items-center">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: lightTheme["--color-text-main"] }}
        >
          Image
        </label>
        <label
          htmlFor="imageUpload"
          className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md cursor-pointer transition-colors duration-300"
          style={{
            background: lightTheme["--color-secondary"],
            color: lightTheme["--color-white"],
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = lightTheme["--color-secondary-hover"])
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = lightTheme["--color-secondary"])
          }
        >
          اختر صورة
        </label>
        <input
          id="imageUpload"
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {formData.image && (
          <img
            src={URL.createObjectURL(formData.image)}
            alt="Preview"
            className="mt-3 sm:mt-4 w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-full border-2 shadow"
            style={{ borderColor: lightTheme["--color-primary"] }}
          />
        )}
      </div>

      {/* زر الحفظ */}
      <button
        type="submit"
        className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md w-full justify-center transition-colors duration-300"
        style={{
          background: lightTheme["--color-secondary"],
          color: lightTheme["--color-white"],
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = lightTheme["--color-secondary-hover"])
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = lightTheme["--color-secondary"])
        }
      >
        <FaSave /> Save
      </button>
    </form>
  );
};

export default ProfileForm;
