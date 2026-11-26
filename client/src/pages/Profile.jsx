import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/authService';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Profile() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({ name: user.name, phone: user.phone || '', jobTitle: user.jobTitle || '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSavingProfile(true);
    try {
      setUser(await authApi.updateProfile(profile));
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.userMessage });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (pw.newPassword !== pw.confirm) return setPwMsg({ type: 'error', text: 'New passwords do not match.' });
    setSavingPw(true);
    try {
      setUser(await authApi.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }));
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg({ type: 'success', text: 'Password changed.' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.userMessage });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <>
      <PageHeader title="Profile" subtitle={user.email} />
      <div className="grid gap-6 lg:grid-cols-2 max-w-4xl">
        <form onSubmit={saveProfile} className="bg-white rounded-xl2 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Personal details</h2>
          <Alert type={profileMsg.type || 'info'}>{profileMsg.text}</Alert>
          <FormField label="Full name" id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
          <FormField label="Phone" id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          <FormField label="Job title" id="jobTitle" value={profile.jobTitle} onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })} />
          <Button type="submit" loading={savingProfile}>Save changes</Button>
        </form>

        <form onSubmit={savePassword} className="bg-white rounded-xl2 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Change password</h2>
          <Alert type={pwMsg.type || 'info'}>{pwMsg.text}</Alert>
          <FormField label="Current password" id="currentPassword" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
          <FormField label="New password" id="newPassword" type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required />
          <FormField label="Confirm new password" id="confirm" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
          <Button type="submit" loading={savingPw}>Update password</Button>
        </form>
      </div>
    </>
  );
}