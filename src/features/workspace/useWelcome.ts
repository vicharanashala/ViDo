import { useCallback, useState } from 'react';
import { toDateKey } from '../../data/taskDates';
import {
  loadIntention,
  loadProfile,
  saveIntention,
  saveProfile,
  type Profile,
} from '../../lib/welcomeStore';

export function useWelcome() {
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const todayKey = toDateKey(new Date());
  const [intention, setIntention] = useState(() => loadIntention(todayKey));

  const saveProfileDetails = useCallback((input: { prefix: string; name: string }) => {
    const next: Profile = {
      prefix: input.prefix.trim().slice(0, 12),
      name: input.name.trim().slice(0, 40),
      welcomed: true,
    };
    setProfile(next);
    saveProfile(next);
  }, []);

  const updateIntention = useCallback(
    (text: string) => {
      setIntention(text);
      saveIntention(todayKey, text);
    },
    [todayKey]
  );

  return {
    prefix: profile.prefix,
    name: profile.name,
    welcomed: profile.welcomed,
    intention,
    saveProfile: saveProfileDetails,
    updateIntention,
  };
}
