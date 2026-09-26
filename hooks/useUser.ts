import { useState, useCallback, useEffect } from 'react';
import { userService, UserProfile, UpdateProfileData, ChangePasswordData } from '@/services/userService';
import { toast } from 'sonner';

/**
 * useUser — the single hook for user profile management.
 * 
 * Provides methods to fetch, update profile, and change password.
 * Ensures the UI reflects changes instantly via local state updates.
 */
export function useUser() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUserProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.message || 'Failed to fetch profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while fetching profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = async (data: UpdateProfileData) => {
    setIsLoading(true);
    try {
      const response = await userService.updateProfile(data);
      if (response.success && response.data) {
        setProfile(response.data);
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(response.message || 'Failed to update profile');
        return false;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred while updating profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    setIsLoading(true);
    try {
      const response = await userService.changePassword(data);
      if (response.success) {
        toast.success('Password changed successfully');
        return true;
      } else {
        toast.error(response.message || 'Failed to change password');
        return false;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred while changing password');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    changePassword,
    refreshProfile: fetchProfile
  };
}

// reviewed