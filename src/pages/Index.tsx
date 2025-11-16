import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { MemberManagement } from '@/components/MemberManagement';
import { TaskManagement } from '@/components/TaskManagement';
import { ItemInventory } from '@/components/ItemInventory';
import { Button } from '@/components/ui/button';
import { fetchMembers, loginMember } from '@/lib/memberApi';
import { fetchTasks } from '@/lib/taskApi';
import { fetchItems } from '@/lib/itemApi';

type Tab = 'dashboard' | 'tasks' | 'items' | 'members';

function getStoredUser() {
  try {
    const user = localStorage.getItem('homeharmony-user');
    if (!user) return null;
    const parsed = JSON.parse(user);
    // Ensure is_admin is boolean
    if (parsed && typeof parsed.is_admin !== 'boolean') {
      parsed.is_admin = parsed.is_admin === true || parsed.is_admin === 'true';
    }
    return parsed;
  } catch {
    return null;
  }
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [members, setMembers] = useState([]);
  
  const [tasks, setTasks] = useState([]);

  const [items, setItems] = useState([]);

  // Auth state
  const [user, setUser] = useState(getStoredUser());
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Save members to localStorage (for display purposes)
  useEffect(() => {
    localStorage.setItem('homeharmony-members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('homeharmony-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('homeharmony-user');
    }
  }, [user]);

  // Load members from localStorage on mount (for display purposes)
  useEffect(() => {
    const savedMembers = localStorage.getItem('homeharmony-members');
    if (savedMembers) setMembers(JSON.parse(savedMembers));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const found = await loginMember(loginForm.username.trim(), loginForm.password);
      if (found) {
        found.is_admin = Boolean(found.is_admin); // Ensure boolean
        setUser(found);
        // Fetch all data from Supabase after login
        const [allMembers, allTasks, allItems] = await Promise.all([
          fetchMembers(),
          fetchTasks(),
          fetchItems()
        ]);
        setMembers(allMembers);
        setTasks(allTasks);
        setItems(allItems);
      } else {
        setLoginError('Invalid username or password');
      }
    } catch (err: unknown) {
      setLoginError('Login failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard members={members} tasks={tasks} items={items} />;
      case 'tasks':
        return <TaskManagement members={members} tasks={tasks} setTasks={setTasks} user={user} />;
      case 'items':
        return <ItemInventory items={items} setItems={setItems} />;
      case 'members':
        return <MemberManagement members={members} setMembers={setMembers} currentUser={user} />;
      default:
        return <Dashboard members={members} tasks={tasks} items={items} />;
    }
  };

  const currentMember = user;

  // Always require login before rendering app content
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm space-y-6">
          <h2 className="text-2xl font-bold text-center">HomeHarmony Login</h2>
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
            <input
              id="username"
              type="text"
              className="w-full border rounded px-3 py-2"
              value={loginForm.username}
              onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
              autoFocus
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              className="w-full border rounded px-3 py-2"
              value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
            />
          </div>
          {loginError && <div className="text-red-600 text-sm text-center">{loginError}</div>}
          <Button type="submit" className="w-full">Login</Button>
          <div className="text-xs text-gray-500 text-center pt-2">
            <div>Default users: quang, loi, huy (password: ****)</div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={currentMember?.name}
        userAvatar={currentMember?.avatar}
        userColor={currentMember?.color}
      >
        <div className="ml-auto">
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </Header>
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'tasks' ? (
          <TaskManagement members={members} tasks={tasks} setTasks={setTasks} user={currentMember} />
        ) : renderContent()}
      </main>
    </div>
  );
};

export default Index;
