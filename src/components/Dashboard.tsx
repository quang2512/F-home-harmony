import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
  assignedTo: string;
  completed: boolean;
  priority: string;
  dueDate: Date;
  weight: number;
}

interface Item {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
}

interface DashboardProps {
  members: Member[];
  tasks: Task[];
  items: Item[];
}

export const Dashboard: React.FC<DashboardProps> = ({ members, tasks, items }) => {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const lowStockItems = items.filter(item => item.quantity <= item.minQuantity);
  
  const overdueTasks = tasks.filter(task => 
    !task.completed && new Date(task.dueDate) < new Date()
  );

  const getMemberWorkload = () => {
    return members.map(member => {
      const memberTasks = tasks.filter(task => task.assignedTo === member.id);
      const totalWeight = memberTasks.reduce((sum, task) => sum + task.weight, 0);
      const completedWeight = memberTasks
        .filter(task => task.completed)
        .reduce((sum, task) => sum + task.weight, 0);
      
      return {
        ...member,
        totalTasks: memberTasks.length,
        totalWeight,
        completedWeight,
        completionRate: totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Tasks</p>
                <p className="text-3xl font-bold">{totalTasks}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Completed</p>
                <p className="text-3xl font-bold">{completedTasks}</p>
              </div>
              <div className="text-4xl">🎉</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Low Stock Items</p>
                <p className="text-3xl font-bold">{lowStockItems.length}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Overdue</p>
                <p className="text-3xl font-bold">{overdueTasks.length}</p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>Overall Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Completion Rate</span>
                  <span>{completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={completionRate} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Completed: </span>
                  <span className="font-semibold">{completedTasks}</span>
                </div>
                <div>
                  <span className="text-gray-500">Remaining: </span>
                  <span className="font-semibold">{totalTasks - completedTasks}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>👥</span>
              <span>Member Workload</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getMemberWorkload().map(member => (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${member.color} rounded-full flex items-center justify-center text-white text-sm`}>
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-sm text-gray-500">{member.totalTasks} tasks</span>
                    </div>
                    <Progress value={member.completionRate} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-600">
              <span>⚠️</span>
              <span>Low Stock Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="destructive">{item.quantity} {item.unit}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
