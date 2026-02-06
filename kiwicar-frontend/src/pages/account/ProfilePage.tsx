import { useState, useRef, useEffect } from 'react';
import { Camera, User, Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import { useProfile } from '@/hooks/useProfile';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { PageSpinner } from '@/components/common';

const NZ_REGIONS = [
  { value: '', label: 'Select a region' },
  { value: 'Auckland', label: 'Auckland' },
  { value: 'Wellington', label: 'Wellington' },
  { value: 'Canterbury', label: 'Canterbury' },
  { value: 'Waikato', label: 'Waikato' },
  { value: 'Bay of Plenty', label: 'Bay of Plenty' },
  { value: 'Manawatu-Wanganui', label: 'Manawatu-Wanganui' },
  { value: 'Otago', label: 'Otago' },
  { value: "Hawke's Bay", label: "Hawke's Bay" },
  { value: 'Northland', label: 'Northland' },
  { value: 'Taranaki', label: 'Taranaki' },
  { value: 'Southland', label: 'Southland' },
  { value: 'Nelson', label: 'Nelson' },
  { value: 'Marlborough', label: 'Marlborough' },
  { value: 'Gisborne', label: 'Gisborne' },
  { value: 'West Coast', label: 'West Coast' },
  { value: 'Tasman', label: 'Tasman' },
];

export default function ProfilePage() {
  const { profile, isLoading, error, updateProfile, uploadAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '');
      setPhone(profile.phone || '');
      setRegion(profile.region || '');
      setShowPhone(profile.showPhone);
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setSaveMessage({ type: 'error', text: 'Please upload a JPEG, PNG, or WebP image' });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    setIsUploadingAvatar(true);
    setSaveMessage(null);

    const result = await uploadAvatar(file);
    setIsUploadingAvatar(false);

    if (result.success) {
      setSaveMessage({ type: 'success', text: 'Avatar updated successfully' });
    } else {
      setSaveMessage({ type: 'error', text: result.error || 'Failed to upload avatar' });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    const result = await updateProfile({
      nickname: nickname || undefined,
      phone: phone || undefined,
      region: region || undefined,
      showPhone,
    });

    setIsSaving(false);

    if (result.success) {
      setSaveMessage({ type: 'success', text: 'Profile updated successfully' });
    } else {
      setSaveMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className={cn(
                  'w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center',
                  'border-2 border-gray-200 hover:border-primary-500 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  isUploadingAvatar && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                ) : profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-400" />
                )}
              </button>
              <div
                className={cn(
                  'absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full',
                  'flex items-center justify-center cursor-pointer',
                  'hover:bg-primary-700 transition-colors'
                )}
                onClick={handleAvatarClick}
              >
                <Camera className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Click to upload a new photo</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nickname
              </label>
              <Input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
              />
              <p className="mt-1 text-xs text-gray-500">
                This is how you'll appear to other users
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 021 123 4567"
              />
            </div>

            {/* Phone Visibility Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Show phone number</p>
                <p className="text-xs text-gray-500">
                  Allow buyers to see your phone number on listings
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showPhone}
                onClick={() => setShowPhone(!showPhone)}
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full',
                  'border-2 border-transparent transition-colors duration-200 ease-in-out',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  showPhone ? 'bg-primary-600' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full',
                    'bg-white shadow ring-0 transition duration-200 ease-in-out',
                    showPhone ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <Select
                options={NZ_REGIONS}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Your default region for listings
              </p>
            </div>

            {/* Save Message */}
            {saveMessage && (
              <div
                className={cn(
                  'p-3 rounded-lg text-sm',
                  saveMessage.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                )}
              >
                {saveMessage.text}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
