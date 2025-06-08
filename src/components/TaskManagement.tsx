import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getTimeLeft } from '@/lib/utils';
import { Edit } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isAdmin: boolean;
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
  user: { name: string; username: string; password: string };
}

export const TaskManagement: React.FC<TaskManagementProps> = ({ members, tasks, setTasks, user }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    schedule: '',
    priority: 'medium',
    duration: 30,
    weight: 2
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
      task.id === taskId
        ? { ...task, completed: !task.completed, dueDate: !task.completed ? new Date() : task.dueDate }
        : task
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

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  const handleEditChange = (field: keyof Task, value: any) => {
    if (!editingTask) return;
    setEditingTask({ ...editingTask, [field]: value });
  };

  const saveTaskEdits = () => {
    if (!editingTask) return;
    setTasks(tasks.map(t => t.id === editingTask.id ? { ...editingTask } : t));
    setEditDialogOpen(false);
    setEditingTask(null);
  };

  const currentMember = members.find(m => m.name.toLowerCase() === user.username);
  const isCurrentUserAdmin = !!currentMember?.isAdmin;

  // Helper to get next member for assignment
  function getNextMemberId(members: Member[], currentId: string): string {
    if (members.length === 0) return '';
    const idx = members.findIndex(m => m.id === currentId);
    return members[(idx + 1) % members.length].id;
  }

  // Recurring scheduling effect
  const scheduledRef = useRef<{ [taskId: string]: boolean }>({});
  useEffect(() => {
    const now = new Date();
    tasks.forEach(task => {
      if (task.completed && !scheduledRef.current[task.id]) {
        // Schedule for 5AM next day
        const next5am = new Date(task.dueDate);
        next5am.setDate(next5am.getDate() + 1);
        next5am.setHours(5, 0, 0, 0);
        if (now >= next5am) {
          // Create new task instance, assigned to next member
          const nextAssignedTo = getNextMemberId(members, task.assignedTo);
          const newTask = {
            ...task,
            id: Date.now().toString(),
            assignedTo: nextAssignedTo,
            completed: false,
            dueDate: new Date(next5am.getTime() + (task.duration || 1) * 24 * 60 * 60 * 1000),
          };
          setTasks([...tasks, newTask]);
          scheduledRef.current[task.id] = true;
        }
      }
    });
  }, [tasks, members, setTasks]);

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
                    <Label htmlFor="duration">Duration (day)</Label>
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
          const isAssignedToCurrentUser = member && user && member.name.toLowerCase() === user.username;
          const canMarkComplete = isCurrentUserAdmin || isAssignedToCurrentUser;
          return (
            <Card key={task.id} className={`transition-all duration-200 hover:shadow-lg ${task.completed ? 'opacity-75' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                  <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                    {task.priority}
                  </Badge>
                    <Button size="icon" variant="ghost" aria-label="Edit Task" onClick={() => openEditDialog(task)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
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
                    <span>Duration: {task.duration} days</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>Time left: {getTimeLeft(task.dueDate)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => toggleTaskCompletion(task.id)}
                  variant={task.completed ? "outline" : "default"}
                  className="w-full"
                  disabled={!canMarkComplete}
                  aria-disabled={!canMarkComplete}
                  title={canMarkComplete ? undefined : 'Only the assigned user or an admin can mark this task complete'}
                >
                  {task.completed ? '↩️ Mark Incomplete' : '✅ Mark Complete'}
                </Button>
                {!canMarkComplete && (
                  <div className="text-xs text-gray-400 text-center mt-1">Only the assigned user or an admin can mark this task complete</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-taskName">Task Name</Label>
                <Input
                  id="edit-taskName"
                  value={editingTask.name}
                  onChange={e => handleEditChange('name', e.target.value)}
                  placeholder="e.g., Clean Kitchen"
                />
              </div>
              <div>
                <Label htmlFor="edit-taskDescription">Description</Label>
                <Textarea
                  id="edit-taskDescription"
                  value={editingTask.description}
                  onChange={e => handleEditChange('description', e.target.value)}
                  placeholder="Detailed description of the task"
                />
              </div>
              <div>
                <Label htmlFor="edit-schedule">Schedule</Label>
                <Input
                  id="edit-schedule"
                  value={editingTask.schedule}
                  onChange={e => handleEditChange('schedule', e.target.value)}
                  placeholder="e.g., Monday, Wednesday, Friday"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={editingTask.priority} onValueChange={value => handleEditChange('priority', value)}>
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
                  <Label htmlFor="edit-duration">Duration (min)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editingTask.duration}
                    onChange={e => handleEditChange('duration', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-weight">Difficulty (1-5)</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    min="1"
                    max="5"
                    value={editingTask.weight}
                    onChange={e => handleEditChange('weight', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editingTask.dueDate instanceof Date ? editingTask.dueDate.toISOString().slice(0, 10) : editingTask.dueDate}
                  onChange={e => handleEditChange('dueDate', new Date(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="edit-assignedTo">Assigned To</Label>
                <Select value={editingTask.assignedTo} onValueChange={value => handleEditChange('assignedTo', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(member => (
                      <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={saveTaskEdits} className="w-full">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
