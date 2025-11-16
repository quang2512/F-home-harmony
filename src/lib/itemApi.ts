import { supabase } from "./supabase";

const ITEM_SCHEMA = "items";
const BASE_SELECTED_FIELDS = "id, name, quantity, min_quantity, unit";

export interface Item {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
}

export interface ItemFromDB {
  id: string;
  name: string;
  quantity: number;
  min_quantity: number;
  unit: string;
}

// Convert database item to component item
function dbItemToItem(dbItem: ItemFromDB): Item {
  return {
    id: dbItem.id,
    name: dbItem.name,
    quantity: dbItem.quantity,
    minQuantity: dbItem.min_quantity,
    unit: dbItem.unit,
  };
}

// Convert component item to database item
function itemToDbItem(item: Item): Omit<ItemFromDB, 'id'> {
  return {
    name: item.name,
    quantity: item.quantity,
    min_quantity: item.minQuantity,
    unit: item.unit,
  };
}

export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from(ITEM_SCHEMA)
    .select(BASE_SELECTED_FIELDS)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(dbItemToItem);
}

export async function addItem(item: Omit<Item, "id">): Promise<Item> {
  const dbItem = itemToDbItem(item as Item);
  const { data, error } = await supabase
    .from(ITEM_SCHEMA)
    .insert([dbItem])
    .select(BASE_SELECTED_FIELDS)
    .single();

  if (error) throw error;
  return dbItemToItem(data);
}

export async function updateItem(
  id: string,
  updates: Partial<Item>
): Promise<Item> {
  const dbUpdates: Partial<ItemFromDB> = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
  if (updates.minQuantity !== undefined) dbUpdates.min_quantity = updates.minQuantity;
  if (updates.unit !== undefined) dbUpdates.unit = updates.unit;

  const { data, error } = await supabase
    .from(ITEM_SCHEMA)
    .update(dbUpdates)
    .eq("id", id)
    .select(BASE_SELECTED_FIELDS)
    .single();

  if (error) throw error;
  return dbItemToItem(data);
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from(ITEM_SCHEMA).delete().eq("id", id);
  if (error) throw error;
}
