import { users, type User, type InsertUser, type GrillItemType, type InsertGrillItem } from "@shared/schema";

// Default grill items that come with the app
const defaultGrillItems: GrillItemType[] = [
  { id: 'maissi', name: 'Maissi', type: 'veggie', cookTimePerSide: 3, sides: 8, notes: '6-8 kääntöä' },
  { id: 'parsa', name: 'Parsa', type: 'veggie', cookTimePerSide: 3.5, sides: 2, notes: '' },
  { id: 'pekonisienet', name: 'Pekonisienet', type: 'veggie', cookTimePerSide: 5, sides: 2, notes: '+2min isoille sienille' },
  { id: 'kana', name: 'Kana', type: 'meat', cookTimePerSide: 5, sides: 2, notes: '' },
  { id: 'ulkofile', name: 'Ulkofile', type: 'meat', cookTimePerSide: 2.5, sides: 2, notes: '' },
  { id: 'salaatti', name: 'Salaatti', type: 'veggie', cookTimePerSide: 2, sides: 1, notes: '' },
  { id: 'lohi', name: 'Lohi', type: 'fish', cookTimePerSide: 3, cookTimeSecondSide: 5, sides: 2, notes: 'muista öljy' },
  { id: 'makkara', name: 'Makkara', type: 'meat', cookTimePerSide: 6, sides: 2, notes: '' }
];

export interface IStorage {
  // User operations (required by setup)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Grill item operations
  getGrillItems(): Promise<GrillItemType[]>;
  getGrillItemById(id: string): Promise<GrillItemType | undefined>;
  addGrillItem(item: InsertGrillItem): Promise<GrillItemType>;
  removeGrillItem(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private grillItems: Map<string, GrillItemType>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.grillItems = new Map();
    this.currentId = 1;

    // Initialize with default grill items
    defaultGrillItems.forEach(item => {
      this.grillItems.set(item.id, item);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Grill item operations
  async getGrillItems(): Promise<GrillItemType[]> {
    return Array.from(this.grillItems.values());
  }

  async getGrillItemById(id: string): Promise<GrillItemType | undefined> {
    return this.grillItems.get(id);
  }

  async addGrillItem(item: InsertGrillItem): Promise<GrillItemType> {
    const id = `custom_${Date.now()}`;
    const newItem: GrillItemType = { 
      ...item, 
      id,
      notes: item.notes || "" 
    };
    this.grillItems.set(id, newItem);
    return newItem;
  }

  async removeGrillItem(id: string): Promise<boolean> {
    // Don't allow removing default items
    if (defaultGrillItems.some(item => item.id === id)) {
      return false;
    }
    return this.grillItems.delete(id);
  }
}

export const storage = new MemStorage();
