import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertIntentSchema, 
  insertOfferSchema, 
  insertPurchaseSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Check if user is authenticated middleware
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // INTENT ROUTES
  // Get all intents (for producers to browse)
  app.get("/api/intents", isAuthenticated, async (req, res) => {
    const status = req.query.status as string | undefined;
    const intents = await storage.getIntents({ status });
    res.json(intents);
  });

  // Get user's intents
  app.get("/api/user/intents", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const intents = await storage.getIntents({ userId });
    res.json(intents);
  });

  // Get a specific intent
  app.get("/api/intents/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const intent = await storage.getIntent(id);
    
    if (!intent) {
      return res.status(404).json({ message: "Intent not found" });
    }
    
    res.json(intent);
  });

  // Create a new intent
  app.post("/api/intents", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const intentData = insertIntentSchema.parse({
        ...req.body,
        userId
      });
      
      const intent = await storage.createIntent(intentData);
      res.status(201).json(intent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid intent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create intent" });
    }
  });

  // Update an intent
  app.patch("/api/intents/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      const intent = await storage.getIntent(id);
      
      if (!intent) {
        return res.status(404).json({ message: "Intent not found" });
      }
      
      if (intent.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this intent" });
      }
      
      const updatedIntent = await storage.updateIntent(id, req.body);
      res.json(updatedIntent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update intent" });
    }
  });

  // Delete an intent
  app.delete("/api/intents/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      const intent = await storage.getIntent(id);
      
      if (!intent) {
        return res.status(404).json({ message: "Intent not found" });
      }
      
      if (intent.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this intent" });
      }
      
      const success = await storage.deleteIntent(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete intent" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete intent" });
    }
  });

  // OFFER ROUTES
  // Get offers for a specific intent
  app.get("/api/intents/:intentId/offers", isAuthenticated, async (req, res) => {
    const intentId = parseInt(req.params.intentId);
    const userId = req.user!.id;
    const intent = await storage.getIntent(intentId);
    
    if (!intent) {
      return res.status(404).json({ message: "Intent not found" });
    }
    
    // Only the intent owner can see offers for their intent
    if (intent.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to view these offers" });
    }
    
    const offers = await storage.getOffers({ intentId });
    res.json(offers);
  });

  // Get all offers made by a producer
  app.get("/api/user/offers", isAuthenticated, async (req, res) => {
    const producerId = req.user!.id;
    const offers = await storage.getOffers({ producerId });
    res.json(offers);
  });

  // Create a new offer
  app.post("/api/offers", isAuthenticated, async (req, res) => {
    try {
      const producerId = req.user!.id;
      
      // Check if user is a company or producer
      if (req.user!.userType !== "company" && req.user!.userType !== "producer") {
        return res.status(403).json({ message: "Only companies can create offers" });
      }
      
      // Check if intent exists
      const intentId = req.body.intentId;
      const intent = await storage.getIntent(intentId);
      if (!intent) {
        return res.status(404).json({ message: "Intent not found" });
      }
      
      const offerData = insertOfferSchema.parse({
        ...req.body,
        producerId
      });
      
      const offer = await storage.createOffer(offerData);
      res.status(201).json(offer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid offer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create offer" });
    }
  });

  // Update an offer
  app.patch("/api/offers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const producerId = req.user!.id;
      const offer = await storage.getOffer(id);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      if (offer.producerId !== producerId) {
        return res.status(403).json({ message: "Not authorized to update this offer" });
      }
      
      const updatedOffer = await storage.updateOffer(id, req.body);
      res.json(updatedOffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update offer" });
    }
  });

  // Delete an offer
  app.delete("/api/offers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const producerId = req.user!.id;
      const offer = await storage.getOffer(id);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      if (offer.producerId !== producerId) {
        return res.status(403).json({ message: "Not authorized to delete this offer" });
      }
      
      const success = await storage.deleteOffer(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete offer" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete offer" });
    }
  });

  // PURCHASE ROUTES
  // Get user's purchases
  app.get("/api/user/purchases", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const purchases = await storage.getPurchases({ userId });
    res.json(purchases);
  });

  // Create a new purchase
  app.post("/api/purchases", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Check if intent exists and belongs to user
      const intentId = req.body.intentId;
      const intent = await storage.getIntent(intentId);
      if (!intent) {
        return res.status(404).json({ message: "Intent not found" });
      }
      
      if (intent.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to complete this intent" });
      }
      
      // Check if offer exists if provided
      if (req.body.offerId) {
        const offerId = req.body.offerId;
        const offer = await storage.getOffer(offerId);
        if (!offer) {
          return res.status(404).json({ message: "Offer not found" });
        }
        
        if (offer.intentId !== intentId) {
          return res.status(400).json({ message: "Offer is not for this intent" });
        }
      }
      
      const purchaseData = insertPurchaseSchema.parse({
        ...req.body,
        userId
      });
      
      const purchase = await storage.createPurchase(purchaseData);
      res.status(201).json(purchase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid purchase data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  // Get stats for dashboard
  app.get("/api/user/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userType = req.user!.userType;
      
      if (userType === "consumer") {
        const activeIntents = await storage.getIntents({ userId, status: "active" });
        const purchases = await storage.getPurchases({ userId });
        
        // Get all offers for user's active intents
        let newOffers = [];
        for (const intent of activeIntents) {
          const intentOffers = await storage.getOffers({ intentId: intent.id, status: "pending" });
          newOffers = [...newOffers, ...intentOffers];
        }
        
        // Calculate potential savings
        let potentialSavings = 0;
        for (const offer of newOffers) {
          if (offer.originalPrice && offer.price) {
            potentialSavings += (offer.originalPrice - offer.price);
          }
        }
        
        res.json({
          activeIntents: activeIntents.length,
          newOffers: newOffers.length,
          completedPurchases: purchases.length,
          potentialSavings
        });
      } else if (userType === "producer") {
        const offers = await storage.getOffers({ producerId: userId });
        const pendingOffers = offers.filter(o => o.status === "pending").length;
        const acceptedOffers = offers.filter(o => o.status === "accepted").length;
        
        res.json({
          totalOffers: offers.length,
          pendingOffers,
          acceptedOffers
        });
      } else {
        res.status(400).json({ message: "Invalid user type" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Market Analytics for Offer Builder
  app.get("/api/market/analytics", async (req, res) => {
    try {
      const filters: any = { status: "active" };
      
      // Apply query filters
      if (req.query.category) filters.category = req.query.category;
      if (req.query.region) filters.region = req.query.region;
      if (req.query.search) filters.search = req.query.search;
      
      // Get filtered intents
      const allIntents = await storage.getIntents(filters);
      
      // Apply budget filtering
      let filteredIntents = allIntents;
      if (req.query.budgetFilter && req.query.budgetFilter !== "all") {
        const budgetFilter = req.query.budgetFilter as string;
        filteredIntents = allIntents.filter(intent => {
          switch (budgetFilter) {
            case "under-500":
              return intent.budgetMax < 500;
            case "500-1000":
              return intent.budgetMin >= 500 && intent.budgetMax <= 1000;
            case "1000-2000":
              return intent.budgetMin >= 1000 && intent.budgetMax <= 2000;
            case "over-2000":
              return intent.budgetMin > 2000;
            default:
              return true;
          }
        });
      }
      
      // Apply timeframe filtering
      if (req.query.timeframeFilter && req.query.timeframeFilter !== "all") {
        const timeframeFilter = req.query.timeframeFilter as string;
        filteredIntents = filteredIntents.filter(intent => {
          const timeframe = intent.timeframe.toLowerCase();
          switch (timeframeFilter) {
            case "week":
              return timeframe.includes("week");
            case "month":
              return timeframe.includes("month");
            case "ASAP":
              return timeframe.includes("asap") || timeframe.includes("urgent");
            default:
              return true;
          }
        });
      }
      
      // Calculate analytics
      const totalIntents = filteredIntents.length;
      const avgBudget = totalIntents > 0 ? 
        filteredIntents.reduce((sum, intent) => sum + ((intent.budgetMin + intent.budgetMax) / 2), 0) / totalIntents : 0;
      
      const urgentIntents = filteredIntents.filter(intent => {
        const timeframe = intent.timeframe.toLowerCase();
        return timeframe.includes("asap") || timeframe.includes("urgent") || timeframe.includes("week");
      }).length;
      
      const urgencyRate = totalIntents > 0 ? (urgentIntents / totalIntents) * 100 : 0;
      
      // Top features analysis
      const featureCount: Record<string, number> = {};
      filteredIntents.forEach(intent => {
        intent.features.forEach(feature => {
          featureCount[feature] = (featureCount[feature] || 0) + 1;
        });
      });
      
      const topFeatures = Object.entries(featureCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([feature, count]) => [feature, count]);
      
      res.json({
        totalIntents,
        avgBudget: Math.round(avgBudget),
        urgentIntents,
        urgencyRate: Math.round(urgencyRate),
        topFeatures
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get market analytics" });
    }
  });

  // Accept an offer
  app.patch("/api/offers/:id/accept", isAuthenticated, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const userId = req.user!.id;
      const offer = await storage.getOffer(offerId);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      // Verify the user owns the intent this offer is for
      const intent = await storage.getIntent(offer.intentId);
      if (!intent || intent.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to accept this offer" });
      }
      
      const updatedOffer = await storage.updateOffer(offerId, { 
        status: "accepted",
        acceptedAt: new Date().toISOString()
      });
      
      res.json(updatedOffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to accept offer" });
    }
  });

  // Decline an offer
  app.patch("/api/offers/:id/decline", isAuthenticated, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const userId = req.user!.id;
      const offer = await storage.getOffer(offerId);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      // Verify the user owns the intent this offer is for
      const intent = await storage.getIntent(offer.intentId);
      if (!intent || intent.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to decline this offer" });
      }
      
      const updatedOffer = await storage.updateOffer(offerId, { 
        status: "declined",
        declinedAt: new Date().toISOString(),
        declineReason: req.body.reason
      });
      
      res.json(updatedOffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to decline offer" });
    }
  });

  // Send message about an offer
  app.post("/api/offers/:id/message", isAuthenticated, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const { message } = req.body;
      const userId = req.user!.id;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const offer = await storage.getOffer(offerId);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      // Verify user can message about this offer
      const intent = await storage.getIntent(offer.intentId);
      const canMessage = (intent && intent.userId === userId) || offer.producerId === userId;
      
      if (!canMessage) {
        return res.status(403).json({ message: "Not authorized to message about this offer" });
      }
      
      // In a real app, you'd store messages in a separate table
      // For now, we'll just return success
      res.json({ 
        success: true, 
        message: "Message sent successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get user's received offers (for consumers)
  app.get("/api/user/received-offers", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get all user's intents
      const userIntents = await storage.getIntents({ userId });
      const intentIds = userIntents.map(intent => intent.id);
      
      // Get all offers for those intents
      const allOffers = [];
      for (const intentId of intentIds) {
        const intentOffers = await storage.getOffers({ intentId });
        allOffers.push(...intentOffers);
      }
      
      res.json(allOffers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get received offers" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
