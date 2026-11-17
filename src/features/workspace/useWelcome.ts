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

  const saveName = useCallback((name: string) => {
    const next: Profile = { name: name.trim().slice(0, 40), welcomed: true };
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
    name: profile.name,
    welcomed: profile.welcomed,
    intention,
    saveName,
    updateIntention,
  };
}
