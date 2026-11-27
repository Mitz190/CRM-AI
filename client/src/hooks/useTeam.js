import { useEffect, useState } from 'react';
import { userApi } from '../services/userService';

export function useTeam(enabled) {
  const [team, setTeam] = useState([]);
  useEffect(() => {
    if (!enabled) return;
    userApi.list({ limit: 100 }).then((d) => setTeam(d.users)).catch(() => setTeam([]));
  }, [enabled]);
  return team;
}