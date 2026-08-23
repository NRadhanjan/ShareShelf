import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setProfile(res.data.user))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-sm mx-auto bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-ink mb-6">My profile</h1>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-slate text-xs">Name</p>
            <p className="text-ink font-medium">{profile.name}</p>
          </div>
          <div>
            <p className="text-slate text-xs">Email</p>
            <p className="text-ink font-medium">{profile.email}</p>
          </div>
          <div>
            <p className="text-slate text-xs">Reg no.</p>
            <p className="text-ink font-medium">{profile.regNo}</p>
          </div>
          <div>
            <p className="text-slate text-xs">Member since</p>
            <p className="text-ink font-medium">{new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;