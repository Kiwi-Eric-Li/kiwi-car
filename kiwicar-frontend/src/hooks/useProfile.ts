import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

export interface Profile {
  id: string;
  email: string;
  phone: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  region: string | null;
  showPhone: boolean;
  createdAt: string;
}

interface UpdateProfileData {
  nickname?: string;
  phone?: string;
  region?: string;
  showPhone?: boolean;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, updateUser } = useAuthStore();

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<Profile>('/users/me');
      setProfile(response.data);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.error?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      try {
        const response = await apiClient.put<Profile>('/users/me', data);
        setProfile(response.data);
        // Update auth store with new data
        updateUser({
          nickname: response.data.nickname ?? undefined,
          region: response.data.region ?? undefined,
          phone: response.data.phone ?? undefined,
          phoneVisible: response.data.showPhone,
        });
        return { success: true };
      } catch (err: any) {
        console.error('Failed to update profile:', err);
        return {
          success: false,
          error: err.response?.data?.error?.message || 'Failed to update profile',
        };
      }
    },
    [updateUser]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await apiClient.post<{ avatarUrl: string }>(
          '/users/me/avatar',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setProfile((prev) =>
          prev ? { ...prev, avatarUrl: response.data.avatarUrl } : null
        );
        updateUser({ avatar: response.data.avatarUrl });
        return { success: true, avatarUrl: response.data.avatarUrl };
      } catch (err: any) {
        console.error('Failed to upload avatar:', err);
        return {
          success: false,
          error: err.response?.data?.error?.message || 'Failed to upload avatar',
        };
      }
    },
    [updateUser]
  );

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
}
