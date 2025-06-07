
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Member {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  assignedTo: string;
  schedule: string;
  priority: string;
  duration: number;
  completed: boolean;
  dueDate: Date;
  weight: number;
}

interface TaskManagementProps {
  members: Member[];
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({ members, tasks, setTasks }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    schedule: '',
    priority: 'medium',
    duration: 30,
    weight: 2
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const getMember = (id: string) => members.find(m => m.id === id);

  const calculateFairAssignment = () => {
    // Simple fair allocation algorithm based on current workload
    const memberWorkloads = members.map(member => {
      const memberTasks = tasks.filter(task => task.assignedTo === member.id && !task.completed);
      const totalWeight = memberTasks.reduce((sum, task) => sum + task.weight, 0);
      return { id: member.id, workload: totalWeight };
    });
    
    // Find member with lowest workload
    const lightestWorkload = memberWorkloads.reduce((min, member) => 
      member.workload < min.workload ? member : min
    );
    
    return lightestWorkload.id;
  };

  const addTask = () => {
    const assignedTo = calculateFairAssignment();
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      assignedTo,
      completed: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      name: '',
      description: '',
      schedule: '',
      priority: 'medium',
      duration: 30,
      weight: 2
    });
    setIsDialogOpen(false);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const reassignTasks = () => {
    // Redistribute all incomplete tasks fairly
    const incompleteTasks = tasks.filter(task => !task.completed);
    const memberWorkloads = members.map(member => ({ id: member.id, workload: 0 }));
    
    // Sort tasks by weight (heaviest first)
    const sortedTasks = [...incompleteTasks].sort((a, b) => b.weight - a.weight);
    
    // Assign each task to member with lowest current workload
    const updatedTasks = tasks.map(task => {
      if (task.completed) return task;
      
      const lightestMember = memberWorkloads.reduce((min, member) => 
        member.workload < min.workload ? member : min
      );
      
      lightestMember.workload += task.weight;
      return { ...task, assignedTo: lightestMember.id };
    });
    
    setTasks(updatedTasks);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Management</h2>
        <div className="flex space-x-2">
          <Button onClick={reassignTasks} variant="outline">
            ⚖️ Redistribute Tasks
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>➕ Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taskName">Task Name</Label>
                  <Input
                    id="taskName"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    placeholder="e.g., Clean Kitchen"
                  />
                </div>
                <div>
                  <Label htmlFor="taskDescription">Description</Label>
                  <Textarea
                    id="taskDescription"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Detailed description of the task"
                  />
                </div>
                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    value={newTask.schedule}
                    onChange={(e) => setNewTask({ ...newTask, schedule: e.target.value })}
                    placeholder="e.g., Monday, Wednesday, Friday"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newTask.duration}
                      onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Difficulty (1-5)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="1"
                      max="5"
                      value={newTask.weight}
                      onChange={(e) => setNewTask({ ...newTask, weight: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={addTask} className="w-full">Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map(task => {
          const member = getMember(task.assignedTo);
          return (
            <Card key={task.id} className={`transition-all duration-200 hover:shadow-lg ${task.completed ? 'opacity-75' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.name}
                  </CardTitle>
                  <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                    {task.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{task.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Assigned to:</span>
                    {member && (
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 ${member.color} rounded-full flex items-center justify-center text-white text-xs`}>
                          {member.avatar}
                        </div>
                        <span className="text-sm font-medium">{member.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>Schedule: {task.schedule}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>Duration: {task.duration} minutes</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => toggleTaskCompletion(task.id)}
                  variant={task.completed ? "outline" : "default"}
                  className="w-full"
                >
                  {task.completed ? '↩️ Mark Incomplete' : '✅ Mark Complete'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
