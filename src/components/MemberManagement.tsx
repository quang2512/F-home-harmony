import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchMembers, addMember as apiAddMember, updateMember, deleteMember } from '@/lib/memberApi';

interface Member {
  id: string;
  name: string;
  password: string;
  avatar: string;
  color: string;
  isAdmin: boolean;
}

interface MemberManagementProps {
  members: Member[];
  setMembers: (members: Member[]) => void;
  currentUser: Member;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ members, setMembers, currentUser }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    avatar: '👤',
    color: 'bg-blue-500'
  });

  useEffect(() => {
    fetchMembers()
      .then(setMembers)
      .catch(err => alert(err.message));
  }, []);

  const avatarOptions = ['👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '👨‍🍳', '👩‍🍳', '👨‍🎨', '👩‍🎨', '👤', '👥'];
  const colorOptions = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
  ];

  // Find if current user is admin
  const currentMember = members.find(m => m.id === currentUser.id);
  const isCurrentUserAdmin = !!currentMember?.isAdmin;

  const addMember = async () => {
    try {
      const member: Omit<Member, 'id'> = {
        ...newMember,
        password: '', // Set password as needed
        isAdmin: false
      };
      const created = await apiAddMember(member);
      setMembers([...members, created]);
      setNewMember({
        name: '',
        avatar: '👤',
        color: 'bg-blue-500'
      });
      setIsDialogOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleAdmin = async (memberId: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;
      const updated = await updateMember(memberId, { isAdmin: !member.isAdmin });
      setMembers(members.map(m => m.id === memberId ? updated : m));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const removeMember = async (memberId: string) => {
    // Prevent removing the last admin
    const isLastAdmin = members.filter(m => m.isAdmin).length === 1 && 
                        members.find(m => m.id === memberId)?.isAdmin;
    if (isLastAdmin) {
      alert("Cannot remove the last admin. Please assign admin privileges to another member first.");
      return;
    }
    // Prevent removing self
    if (currentMember && currentMember.id === memberId) {
      alert("You cannot remove yourself.");
      return;
    }
    try {
      await deleteMember(memberId);
      setMembers(members.filter(member => member.id !== memberId));
    } catch (err: any) {
      alert(err.message);
    }
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
                  disabled={!isCurrentUserAdmin || (currentMember && currentMember.id === member.id && member.isAdmin)}
                  title={
                    !isCurrentUserAdmin ? 'Only admins can assign or remove admin rights'
                    : (currentMember && currentMember.id === member.id && member.isAdmin) ? 'You cannot remove yourself from admin'
                    : undefined
                  }
                >
                  {member.isAdmin ? '👑 Remove Admin' : '👑 Make Admin'}
                </Button>
                {!isCurrentUserAdmin && (
                  <div className="text-xs text-gray-400 text-center mt-1">Only admins can assign or remove admin rights</div>
                )}
                {currentMember && currentMember.id === member.id && member.isAdmin && (
                  <div className="text-xs text-gray-400 text-center mt-1">You cannot remove yourself from admin</div>
                )}
                <Button
                  onClick={() => removeMember(member.id)}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled={!isCurrentUserAdmin || (currentMember && currentMember.id === member.id) || members.length === 1}
                  title={
                    !isCurrentUserAdmin ? 'Only admins can remove members'
                    : (currentMember && currentMember.id === member.id) ? 'You cannot remove yourself'
                    : members.length === 1 ? 'Cannot remove the last member'
                    : undefined
                  }
                >
                  🗑️ Remove Member
                </Button>
                {!isCurrentUserAdmin && (
                  <div className="text-xs text-gray-400 text-center mt-1">Only admins can remove members</div>
                )}
                {currentMember && currentMember.id === member.id && (
                  <div className="text-xs text-gray-400 text-center mt-1">You cannot remove yourself</div>
                )}
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

