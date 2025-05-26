import { 
  users, type User, type InsertUser,
  intents, type Intent, type InsertIntent,
  offers, type Offer, type InsertOffer,
  purchases, type Purchase, type InsertPurchase
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, like, gte, lte, desc } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Intent operations
  getIntents(filters?: {
    userId?: number, 
    status?: string,
    category?: string,
    region?: string,
    search?: string,
    budgetRange?: { min?: number; max?: number }
  }): Promise<Intent[]>;
  getIntent(id: number): Promise<Intent | undefined>;
  createIntent(intent: InsertIntent): Promise<Intent>;
  updateIntent(id: number, updates: Partial<Intent>): Promise<Intent | undefined>;
  deleteIntent(id: number): Promise<boolean>;
  
  // Offer operations
  getOffers(filters?: {intentId?: number, producerId?: number, status?: string}): Promise<Offer[]>;
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, updates: Partial<Offer>): Promise<Offer | undefined>;
  deleteOffer(id: number): Promise<boolean>;
  
  // Purchase operations
  getPurchases(filters?: {userId?: number, intentId?: number}): Promise<Purchase[]>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private intents: Map<number, Intent>;
  private offers: Map<number, Offer>;
  private purchases: Map<number, Purchase>;
  private userIdCounter: number;
  private intentIdCounter: number;
  private offerIdCounter: number;
  private purchaseIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.intents = new Map();
    this.offers = new Map();
    this.purchases = new Map();
    this.userIdCounter = 1;
    this.intentIdCounter = 1;
    this.offerIdCounter = 1;
    this.purchaseIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Clear expired sessions every day
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

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  // Intent operations
  async getIntents(filters?: { 
    userId?: number; 
    status?: string; 
    category?: string;
    region?: string;
    search?: string;
    budgetRange?: { min?: number; max?: number };
  }): Promise<Intent[]> {
    let results = Array.from(this.intents.values());
    
    if (filters?.userId !== undefined) {
      results = results.filter(intent => intent.userId === filters.userId);
    }
    
    if (filters?.status !== undefined) {
      results = results.filter(intent => intent.status === filters.status);
    }
    
    if (filters?.category !== undefined) {
      results = results.filter(intent => intent.category === filters.category);
    }
    
    if (filters?.region !== undefined) {
      results = results.filter(intent => intent.region === filters.region);
    }
    
    if (filters?.search !== undefined) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(intent => {
        const titleMatch = intent.title.toLowerCase().includes(searchTerm);
        const featureMatch = intent.features.some(feature => 
          feature.toLowerCase().includes(searchTerm)
        );
        return titleMatch || featureMatch;
      });
    }
    
    if (filters?.budgetRange !== undefined) {
      results = results.filter(intent => {
        if (filters.budgetRange!.min && intent.budgetMax < filters.budgetRange!.min) return false;
        if (filters.budgetRange!.max && intent.budgetMin > filters.budgetRange!.max) return false;
        return true;
      });
    }
    
    return results;
  }

  async getIntent(id: number): Promise<Intent | undefined> {
    return this.intents.get(id);
  }

  async createIntent(intentData: InsertIntent): Promise<Intent> {
    const id = this.intentIdCounter++;
    const now = new Date();
    const intent: Intent = { 
      ...intentData, 
      id, 
      status: "active", 
      createdAt: now
    };
    this.intents.set(id, intent);
    return intent;
  }

  async updateIntent(id: number, updates: Partial<Intent>): Promise<Intent | undefined> {
    const intent = this.intents.get(id);
    if (!intent) return undefined;
    
    const updatedIntent = { ...intent, ...updates };
    this.intents.set(id, updatedIntent);
    return updatedIntent;
  }

  async deleteIntent(id: number): Promise<boolean> {
    return this.intents.delete(id);
  }

  // Offer operations
  async getOffers(filters?: { intentId?: number; producerId?: number; status?: string }): Promise<Offer[]> {
    let results = Array.from(this.offers.values());
    
    if (filters?.intentId !== undefined) {
      results = results.filter(offer => offer.intentId === filters.intentId);
    }
    
    if (filters?.producerId !== undefined) {
      results = results.filter(offer => offer.producerId === filters.producerId);
    }
    
    if (filters?.status !== undefined) {
      results = results.filter(offer => offer.status === filters.status);
    }
    
    return results;
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    return this.offers.get(id);
  }

  async createOffer(offerData: InsertOffer): Promise<Offer> {
    const id = this.offerIdCounter++;
    const now = new Date();
    const offer: Offer = { 
      ...offerData, 
      id, 
      status: "pending", 
      createdAt: now
    };
    this.offers.set(id, offer);
    return offer;
  }

  async updateOffer(id: number, updates: Partial<Offer>): Promise<Offer | undefined> {
    const offer = this.offers.get(id);
    if (!offer) return undefined;
    
    const updatedOffer = { ...offer, ...updates };
    this.offers.set(id, updatedOffer);
    return updatedOffer;
  }

  async deleteOffer(id: number): Promise<boolean> {
    return this.offers.delete(id);
  }

  // Purchase operations
  async getPurchases(filters?: { userId?: number; intentId?: number }): Promise<Purchase[]> {
    let results = Array.from(this.purchases.values());
    
    if (filters?.userId !== undefined) {
      results = results.filter(purchase => purchase.userId === filters.userId);
    }
    
    if (filters?.intentId !== undefined) {
      results = results.filter(purchase => purchase.intentId === filters.intentId);
    }
    
    return results;
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async createPurchase(purchaseData: InsertPurchase): Promise<Purchase> {
    const id = this.purchaseIdCounter++;
    const now = new Date();
    const purchase: Purchase = { 
      ...purchaseData, 
      id, 
      completedAt: now
    };
    this.purchases.set(id, purchase);
    
    // Update intent status to completed
    if (purchaseData.intentId) {
      const intent = this.intents.get(purchaseData.intentId);
      if (intent) {
        this.intents.set(intent.id, { ...intent, status: "completed" });
      }
    }
    
    // Update offer status if provided
    if (purchaseData.offerId) {
      const offer = this.offers.get(purchaseData.offerId);
      if (offer) {
        this.offers.set(offer.id, { ...offer, status: "accepted" });
      }
    }
    
    return purchase;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getIntents(filters?: {
    userId?: number, 
    status?: string,
    category?: string,
    region?: string,
    search?: string,
    budgetRange?: { min?: number; max?: number }
  }): Promise<Intent[]> {
    let query = db.select().from(intents);
    
    if (filters?.userId) {
      query = query.where(eq(intents.userId, filters.userId));
    }
    
    return await query.orderBy(desc(intents.createdAt));
  }

  async getIntent(id: number): Promise<Intent | undefined> {
    const [intent] = await db.select().from(intents).where(eq(intents.id, id));
    return intent || undefined;
  }

  async createIntent(intentData: InsertIntent): Promise<Intent> {
    const [intent] = await db
      .insert(intents)
      .values(intentData)
      .returning();
    return intent;
  }

  async updateIntent(id: number, updates: Partial<Intent>): Promise<Intent | undefined> {
    const [intent] = await db
      .update(intents)
      .set(updates)
      .where(eq(intents.id, id))
      .returning();
    return intent || undefined;
  }

  async deleteIntent(id: number): Promise<boolean> {
    const result = await db.delete(intents).where(eq(intents.id, id));
    return result.rowCount > 0;
  }

  async getOffers(filters?: { intentId?: number; producerId?: number; status?: string }): Promise<Offer[]> {
    let query = db.select().from(offers);
    
    if (filters?.producerId) {
      query = query.where(eq(offers.producerId, filters.producerId));
    }
    if (filters?.intentId) {
      query = query.where(eq(offers.intentId, filters.intentId));
    }
    
    return await query.orderBy(desc(offers.createdAt));
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    return offer || undefined;
  }

  async createOffer(offerData: InsertOffer): Promise<Offer> {
    const [offer] = await db
      .insert(offers)
      .values(offerData)
      .returning();
    return offer;
  }

  async updateOffer(id: number, updates: Partial<Offer>): Promise<Offer | undefined> {
    const [offer] = await db
      .update(offers)
      .set(updates)
      .where(eq(offers.id, id))
      .returning();
    return offer || undefined;
  }

  async deleteOffer(id: number): Promise<boolean> {
    const result = await db.delete(offers).where(eq(offers.id, id));
    return result.rowCount > 0;
  }

  async getPurchases(filters?: { userId?: number; intentId?: number }): Promise<Purchase[]> {
    let query = db.select().from(purchases);
    
    if (filters?.userId) {
      query = query.where(eq(purchases.userId, filters.userId));
    }
    if (filters?.intentId) {
      query = query.where(eq(purchases.intentId, filters.intentId));
    }
    
    return await query.orderBy(desc(purchases.completedAt));
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async createPurchase(purchaseData: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values(purchaseData)
      .returning();
    return purchase;
  }
}

// Use DatabaseStorage for deployment readiness
export const storage = new DatabaseStorage();
