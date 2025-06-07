
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { MemberManagement } from '@/components/MemberManagement';
import { TaskManagement } from '@/components/TaskManagement';
import { ItemInventory } from '@/components/ItemInventory';

type Tab = 'dashboard' | 'tasks' | 'items' | 'members';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [members, setMembers] = useState([
    { id: '1', name: 'Quang', avatar: '👨‍💻', color: 'bg-blue-500', isAdmin: true },
    { id: '2', name: 'Loi', avatar: '👨‍🎓', color: 'bg-green-500', isAdmin: false },
    { id: '3', name: 'Huy', avatar: '👨‍🍳', color: 'bg-purple-500', isAdmin: false },
  ]);
  
  const [tasks, setTasks] = useState([
    { 
      id: '1', 
      name: 'Clean Kitchen', 
      description: 'Deep clean counters, sink, and appliances',
      assignedTo: '1', 
      schedule: 'Monday, Wednesday, Friday',
      priority: 'high',
      duration: 45,
      completed: false,
      dueDate: new Date('2025-06-09'),
      weight: 3
    },
    { 
      id: '2', 
      name: 'Laundry', 
      description: 'Wash, dry, and fold shared towels',
      assignedTo: '2', 
      schedule: 'Sunday',
      priority: 'medium',
      duration: 30,
      completed: false,
      dueDate: new Date('2025-06-08'),
      weight: 2
    },
    { 
      id: '3', 
      name: 'Clean Bathroom', 
      description: 'Scrub toilet, shower, and mop floor',
      assignedTo: '3', 
      schedule: 'Tuesday, Saturday',
      priority: 'high',
      duration: 60,
      completed: true,
      dueDate: new Date('2025-06-07'),
      weight: 3
    },
  ]);

  const [items, setItems] = useState([
    { id: '1', name: 'Laundry Detergent', quantity: 2, minQuantity: 1, unit: 'bottles' },
    { id: '2', name: 'Rice', quantity: 5, minQuantity: 2, unit: 'kg' },
    { id: '3', name: 'Toilet Paper', quantity: 8, minQuantity: 4, unit: 'rolls' },
    { id: '4', name: 'Dish Soap', quantity: 1, minQuantity: 1, unit: 'bottle' },
  ]);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('homeharmony-members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('homeharmony-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('homeharmony-items', JSON.stringify(items));
  }, [items]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMembers = localStorage.getItem('homeharmony-members');
    const savedTasks = localStorage.getItem('homeharmony-tasks');
    const savedItems = localStorage.getItem('homeharmony-items');
    
    if (savedMembers) setMembers(JSON.parse(savedMembers));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedItems) setItems(JSON.parse(savedItems));
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard members={members} tasks={tasks} items={items} />;
      case 'tasks':
        return <TaskManagement members={members} tasks={tasks} setTasks={setTasks} />;
      case 'items':
        return <ItemInventory items={items} setItems={setItems} />;
      case 'members':
        return <MemberManagement members={members} setMembers={setMembers} />;
      default:
        return <Dashboard members={members} tasks={tasks} items={items} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
