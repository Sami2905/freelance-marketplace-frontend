"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import RequireAuth from "../RequireAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const { user, fetchProfile, login } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [originalName, setOriginalName] = useState(user?.name ?? "");
  const [originalEmail, setOriginalEmail] = useState(user?.email ?? "");
  const router = useRouter();

  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("");
  const [profilePicLoading, setProfilePicLoading] = useState(false);
  const [profilePicError, setProfilePicError] = useState("");
  const [profilePicSuccess, setProfilePicSuccess] = useState(false);
  const [profilePicVersion, setProfilePicVersion] = useState<number>(0);
  const [imgError, setImgError] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwChangeLoading, setPwChangeLoading] = useState(false);
  const [pwChangeError, setPwChangeError] = useState("");
  const [pwChangeSuccess, setPwChangeSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [stats, setStats] = useState<{gigs: number, orders: number, reviews: number}>({gigs: 0, orders: 0, reviews: 0});
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      await fetchProfile();
      setLoading(false);
    };
    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setOriginalName(user?.name ?? "");
    setOriginalEmail(user?.email ?? "");
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError("");
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const [gigsRes, ordersRes, reviewsRes] = await Promise.all([
          fetch(`${API_URL}/api/gigs?user=${user?._id}`, { credentials: "include" }),
          fetch(`${API_URL}/api/orders?user=${user?._id}`, { credentials: "include" }),
          fetch(`${API_URL}/api/reviews?buyer=${user?._id}`, { credentials: "include" }),
        ]);
        const gigs = await gigsRes.json();
        const orders = await ordersRes.json();
        const reviews = await reviewsRes.json();
        setStats({gigs: gigs.length, orders: orders.length, reviews: reviews.length});
      } catch {
        setStatsError("Failed to load stats");
      } finally {
        setStatsLoading(false);
      }
    };
    if (user?._id) fetchStats();
  }, [user]);

  // Profile picture preview
  useEffect(() => {
    if (profilePicFile) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result as string);
      reader.readAsDataURL(profilePicFile);
    } else {
      setProfilePicPreview("");
    }
  }, [profilePicFile]);

  const handleEdit = () => {
    setEditing(true);
    setError("");
    setSuccess(false);
    setOriginalName(name);
    setOriginalEmail(email);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    // Only proceed if something changed
    if (name === originalName && email === originalEmail) {
      setError("No changes made.");
      return;
    }
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Update failed");
        return;
      }
      await fetchProfile();
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } catch (err) {
      setError("Network error");
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfilePicError("");
    setProfilePicSuccess(false);
    if (e.target.files && e.target.files[0]) {
      setProfilePicFile(e.target.files[0]);
    }
  };

  const handleProfilePicUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilePicFile) return;
    setProfilePicLoading(true);
    setProfilePicError("");
    setProfilePicSuccess(false);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const formData = new FormData();
      formData.append("profilePicture", profilePicFile);
      const res = await fetch(`${API_URL}/api/auth/profile-picture`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setProfilePicError(data.msg || "Upload failed");
        setProfilePicLoading(false);
        return;
      }
      await fetchProfile();
      setProfilePicSuccess(true);
      // Delay clearing preview to ensure new image is available
      setTimeout(() => {
        setProfilePicFile(null);
        setProfilePicPreview("");
        setProfilePicSuccess(false);
        setProfilePicVersion(v => v + 1); // Increment version to bust cache
        setImgError(false); // Reset error state for new image
      }, 1000);
    } catch (err) {
      setProfilePicError("Network error");
    } finally {
      setProfilePicLoading(false);
    }
  };

  // Password change logic
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwChangeError("");
    setPwChangeSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwChangeError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPwChangeError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwChangeError("Passwords do not match.");
      return;
    }
    setPwChangeLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwChangeError(data.msg || "Password change failed");
        setPwChangeLoading(false);
        return;
      }
      setPwChangeSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwChangeSuccess(false), 1500);
    } catch (err) {
      setPwChangeError("Network error");
    } finally {
      setPwChangeLoading(false);
    }
  };

  // Helper to get the correct image URL for uploaded images, with cache busting
  const getProfilePicSrc = (pic: string | undefined | null) => {
    if (!pic || imgError) return "/default-avatar.png";
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    if (pic.startsWith("/uploads/")) return `${API_URL}${pic}?v=${profilePicVersion}`;
    if (pic.startsWith("uploads/")) return `${API_URL}/${pic}?v=${profilePicVersion}`;
    try {
      const url = new URL(pic);
      return url.href;
    } catch {
      return "/default-avatar.png";
    }
  };

  if (loading) return <main className="flex items-center justify-center min-h-[60vh]">Loading...</main>;
  if (!user) return null;

  return (
    <RequireAuth>
      <main className="flex flex-col items-center min-h-[60vh] px-2">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 mb-2">
            <img
              src="/default-avatar.png"
              alt="Profile picture"
              width={96}
              height={96}
              className="rounded-full object-cover border-2 border-blue-600"
              style={{ zIndex: 1 }}
            />
          </div>
          {/* Remove profile picture upload UI */}
        </div>
        {/* Info cards */}
        <section className="w-full max-w-md grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="text-sm text-gray-400">Role</div>
            <div className="text-xl font-bold">{user?.role}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="text-sm text-gray-400">Gigs</div>
            <div className="text-xl font-bold">{statsLoading ? "..." : stats.gigs}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="text-sm text-gray-400">Orders</div>
            <div className="text-xl font-bold">{statsLoading ? "..." : stats.orders}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700 col-span-3">
            <div className="text-sm text-gray-400">Reviews Left</div>
            <div className="text-xl font-bold">{statsLoading ? "..." : stats.reviews}</div>
          </div>
          {statsError && <div className="col-span-3 text-red-500 text-sm">{statsError}</div>}
        </section>
        {/* Profile Info Edit Section */}
        <form onSubmit={handleSave} className="w-full max-w-sm bg-gray-800 p-6 rounded-lg flex flex-col gap-4 mb-8">
          <label className="text-gray-300">Name
            <input type="text" value={name ?? ""} onChange={e => setName(e.target.value)} className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" disabled={!editing} />
          </label>
          <label className="text-gray-300">Email
            <input type="email" value={email ?? ""} onChange={e => setEmail(e.target.value)} className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" disabled={!editing} />
          </label>
          <label className="text-gray-300">Role
            <input type="text" value={user.role} className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" disabled />
          </label>
          {editing ? (
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-2">Save</button>
          ) : (
            <button type="button" onClick={handleEdit} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded mt-2">Edit</button>
          )}
          {success && <div className="text-green-500 text-sm mt-2">Profile updated!</div>}
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
        {/* Password Change Section */}
        <form onSubmit={handlePasswordChange} className="w-full max-w-sm bg-gray-800 p-6 rounded-lg flex flex-col gap-4">
          <h2 className="text-lg font-semibold mb-2">Change Password</h2>
          <label className="text-gray-300">Current Password
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full pr-10"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2 top-2 text-xs text-gray-400">{showPw ? "Hide" : "Show"}</button>
            </div>
          </label>
          <label className="text-gray-300">New Password
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full pr-10"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-2 top-2 text-xs text-gray-400">{showNewPw ? "Hide" : "Show"}</button>
            </div>
          </label>
          <label className="text-gray-300">Confirm New Password
            <div className="relative">
              <input
                type={showConfirmPw ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full pr-10"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-2 top-2 text-xs text-gray-400">{showConfirmPw ? "Hide" : "Show"}</button>
            </div>
          </label>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-2"
            disabled={pwChangeLoading}
          >
            {pwChangeLoading ? "Changing..." : "Change Password"}
          </button>
          {pwChangeSuccess && <div className="text-green-500 text-sm mt-2">Password changed successfully!</div>}
          {pwChangeError && <div className="text-red-500 text-sm mt-2">{pwChangeError}</div>}
        </form>
      </main>
    </RequireAuth>
  );
} 