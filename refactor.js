const fs = require('fs');

const appPath = './src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

const t1 = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('soluna_users') || '[]');
    if (users.find((u: any) => u.username === username)) {
      setError('Username already exists');
      return;
    }

    const newUser = { username, password };
    users.push(newUser);
    localStorage.setItem('soluna_users', JSON.stringify(users));
    onSignUp(newUser);
  };`;

const r1 = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      onSignUp(data.user);
    } catch (err: any) {
      setError(err.message);
    }
  };`;

const t2 = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('soluna_users') || '[]');
    const user = users.find((u: any) => u.username === username && u.password === password);
    
    if (user) {
      onLogin(user, remember);
    } else {
      setError('Invalid username or password.');
    }
  };`;

const r2 = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');
      onLogin(data.user, remember);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    }
  };`;


const t3 = `  useEffect(() => {
    const savedProfile = localStorage.getItem('harmony_profile');
    const savedLogs = localStorage.getItem('harmony_logs');
    const savedDarkMode = localStorage.getItem('harmony_dark_mode');
    const savedReminders = localStorage.getItem('harmony_reminders');
    const savedAuth = localStorage.getItem('soluna_auth');
    
    if (savedAuth) {
      setCurrentUser(JSON.parse(savedAuth));
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
        setView('journal');
      } else {
        setView('onboarding');
      }
    } else {
      setView('welcome');
    }

    if (savedLogs) {
      setDailyLogs(JSON.parse(savedLogs));
    }

    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }

    if (savedReminders) {
      setRemindersEnabled(JSON.parse(savedReminders));
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('harmony_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('harmony_reminders', JSON.stringify(remindersEnabled));
  }, [remindersEnabled]);

  const handleLogin = (user: UserAccount, remember: boolean) => {
    setCurrentUser(user);
    if (remember) {
      localStorage.setItem('soluna_auth', JSON.stringify(user));
    }
    
    const savedProfile = localStorage.getItem('harmony_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setView('journal');
    } else {
      setView('onboarding');
    }
  };

  const handleSignUp = (user: UserAccount) => {
    setCurrentUser(user);
    setView('onboarding');
  };

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    const profileWithUser = { ...newProfile, username: currentUser?.username };
    setProfile(profileWithUser);
    localStorage.setItem('harmony_profile', JSON.stringify(profileWithUser));
    setView('dashboard_placeholder');
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('harmony_profile', JSON.stringify(updatedProfile));
  };

  const handleUpdateLog = (date: string, updates: Partial<DailyLog>) => {
    setDailyLogs(prev => {
      const existing = prev[date] || {
        date,
        habits: []
      };
      const updated = { ...existing, ...updates };
      const newLogs = { ...prev, [date]: updated };
      localStorage.setItem('harmony_logs', JSON.stringify(newLogs));
      return newLogs;
    });
  };`;

const r3 = `  const fetchProfileAndLogs = async (user: UserAccount) => {
    try {
      const [profileRes, logsRes] = await Promise.all([
        fetch('/api/profile', { headers: { 'x-user-id': user.id! } }),
        fetch('/api/logs', { headers: { 'x-user-id': user.id! } })
      ]);
      
      let fetchedProfile = null;
      if (profileRes.ok) {
        const { profile } = await profileRes.json();
        if (profile) fetchedProfile = profile;
        setProfile(fetchedProfile);
      }
      
      if (logsRes.ok) {
        const { logs } = await logsRes.json();
        if (logs && Array.isArray(logs)) {
          const logsMap: Record<string, DailyLog> = {};
          logs.forEach((log: any) => logsMap[log.date] = log);
          setDailyLogs(logsMap);
        }
      }
      return fetchedProfile;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('harmony_dark_mode');
    const savedReminders = localStorage.getItem('harmony_reminders');
    const savedAuth = localStorage.getItem('soluna_auth');
    
    if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode));
    if (savedReminders) setRemindersEnabled(JSON.parse(savedReminders));

    if (savedAuth) {
      const user = JSON.parse(savedAuth);
      setCurrentUser(user);
      fetchProfileAndLogs(user).then(profile => {
        if (profile) {
          setView('journal');
        } else {
          setView('onboarding');
        }
        setIsLoaded(true);
      });
    } else {
      setView('welcome');
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('harmony_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('harmony_reminders', JSON.stringify(remindersEnabled));
  }, [remindersEnabled]);

  const handleLogin = async (user: UserAccount, remember: boolean) => {
    setCurrentUser(user);
    if (remember) {
      localStorage.setItem('soluna_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('soluna_auth');
    }
    
    const fetchedProfile = await fetchProfileAndLogs(user);
    if (fetchedProfile) {
      setView('journal');
    } else {
      setView('onboarding');
    }
  };

  const handleSignUp = (user: UserAccount) => {
    setCurrentUser(user);
    setView('onboarding');
  };

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    const profileWithUser = { ...newProfile, username: currentUser?.username };
    setProfile(profileWithUser);
    
    if (currentUser?.id) {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(profileWithUser)
      });
    }
    setView('dashboard_placeholder');
  };

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    if (currentUser?.id) {
      fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(updatedProfile)
      });
    }
  };

  const handleUpdateLog = (date: string, updates: Partial<DailyLog>) => {
    setDailyLogs(prev => {
      const existing = prev[date] || {
        date,
        habits: []
      };
      const updated = { ...existing, ...updates };
      const newLogs = { ...prev, [date]: updated };
      
      if (currentUser?.id) {
        fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id
          },
          body: JSON.stringify(updated)
        });
      }
      return newLogs;
    });
  };`;

// Check line endings and whitespace issues gracefully by replacing spaces with \s*
function escapeRegExp(string) {
  return string.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
}

function flexibleReplace(content, target, replacement) {
  // convert lines to regex allowing flexible whitespace
  const lines = target.split('\\n');
  const regexStr = lines.map(l => escapeRegExp(l.trim())).join('\\\\s*\\n\\\\s*');
  const regex = new RegExp(regexStr);
  if (!regex.test(content)) {
    console.log("Could not find target!");
    return content;
  }
  return content.replace(regex, replacement);
}

content = flexibleReplace(content, t1, r1);
content = flexibleReplace(content, t2, r2);
content = flexibleReplace(content, t3, r3);

fs.writeFileSync(appPath, content);
console.log('App.tsx refactoring complete');
