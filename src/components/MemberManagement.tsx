
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Member {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isAdmin: boolean;
}

interface MemberManagementProps {
  members: Member[];
  setMembers: (members: Member[]) => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ members, setMembers }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    avatar: '👤',
    color: 'bg-blue-500'
  });

  const avatarOptions = ['👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '👨‍🍳', '👩‍🍳', '👨‍🎨', '👩‍🎨', '👤', '👥'];
  const colorOptions = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
  ];

  const addMember = () => {
    const member: Member = {
      id: Date.now().toString(),
      ...newMember,
      isAdmin: false
    };
    
    setMembers([...members, member]);
    setNewMember({
      name: '',
      avatar: '👤',
      color: 'bg-blue-500'
    });
    setIsDialogOpen(false);
  };

  const toggleAdmin = (memberId: string) => {
    setMembers(members.map(member => 
      member.id === memberId 
        ? { ...member, isAdmin: !member.isAdmin }
        : member
    ));
  };

  const removeMember = (memberId: string) => {
    // Prevent removing the last admin
    const isLastAdmin = members.filter(m => m.isAdmin).length === 1 && 
                        members.find(m => m.id === memberId)?.isAdmin;
    
    if (isLastAdmin) {
      alert("Cannot remove the last admin. Please assign admin privileges to another member first.");
      return;
    }
    
    setMembers(members.filter(member => member.id !== memberId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Member Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>➕ Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="memberName">Member Name</Label>
                <Input
                  id="memberName"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <Label htmlFor="avatar">Avatar</Label>
                <Select value={newMember.avatar} onValueChange={(value) => setNewMember({ ...newMember, avatar: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {avatarOptions.map(avatar => (
                      <SelectItem key={avatar} value={avatar}>
                        <span className="text-lg">{avatar}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="color">Color Theme</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-12 h-12 rounded-lg ${color} border-2 ${
                        newMember.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      onClick={() => setNewMember({ ...newMember, color })}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={addMember} className="w-full">Add Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => (
          <Card key={member.id} className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${member.color} rounded-full flex items-center justify-center text-white text-xl`}>
                    {member.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    {member.isAdmin && (
                      <Badge variant="default" className="text-xs">Admin</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  onClick={() => toggleAdmin(member.id)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {member.isAdmin ? '👑 Remove Admin' : '👑 Make Admin'}
                </Button>
                <Button
                  onClick={() => removeMember(member.id)}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled={members.length === 1}
                >
                  🗑️ Remove Member
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">No Members Added Yet</h3>
            <p className="text-gray-500 mb-4">Add members to start managing your shared living space.</p>
            <Button onClick={() => setIsDialogOpen(true)}>Add Your First Member</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
