
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Item {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
}

interface ItemInventoryProps {
  items: Item[];
  setItems: (items: Item[]) => void;
}

export const ItemInventory: React.FC<ItemInventoryProps> = ({ items, setItems }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 0,
    minQuantity: 1,
    unit: ''
  });

  const addItem = () => {
    const item: Item = {
      id: Date.now().toString(),
      ...newItem
    };
    
    setItems([...items, item]);
    setNewItem({
      name: '',
      quantity: 0,
      minQuantity: 1,
      unit: ''
    });
    setIsDialogOpen(false);
  };

  const updateQuantity = (itemId: string, change: number) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    ));
  };

  const deleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const getStockStatus = (item: Item) => {
    if (item.quantity <= item.minQuantity) {
      return { status: 'low', color: 'bg-red-100 text-red-800', icon: '⚠️' };
    } else if (item.quantity <= item.minQuantity * 2) {
      return { status: 'medium', color: 'bg-yellow-100 text-yellow-800', icon: '📋' };
    } else {
      return { status: 'good', color: 'bg-green-100 text-green-800', icon: '✅' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Item Inventory</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>➕ Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Laundry Detergent"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Current Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="minQuantity">Minimum Quantity</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    value={newItem.minQuantity}
                    onChange={(e) => setNewItem({ ...newItem, minQuantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="e.g., bottles, kg, rolls"
                  />
                </div>
              </div>
              <Button onClick={addItem} className="w-full">Add Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const stockStatus = getStockStatus(item);
          return (
            <Card key={item.id} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge className={stockStatus.color}>
                    {stockStatus.icon} {stockStatus.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-gray-900">{item.quantity}</div>
                  <div className="text-sm text-gray-500">{item.unit}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Min: {item.minQuantity} {item.unit}
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    ➖
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    ➕
                  </Button>
                </div>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteItem(item.id)}
                  className="w-full"
                >
                  🗑️ Delete
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No Items Added Yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your household items by adding them to the inventory.</p>
            <Button onClick={() => setIsDialogOpen(true)}>Add Your First Item</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
