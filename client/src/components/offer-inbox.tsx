import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, MessageSquare, Star, ExternalLink, Calendar, Package, Building2 } from "lucide-react";

interface OfferInboxProps {
  intents: any[];
  offers: any[];
  onAcceptOffer: (offerId: number) => void;
  onRejectOffer: (offerId: number) => void;
  onMessageCompany: (offerId: number, message: string) => void;
}

export function OfferInbox({ intents, offers, onAcceptOffer, onRejectOffer, onMessageCompany }: OfferInboxProps) {
  const { toast } = useToast();
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState<number[]>([]);

  // Group offers by intent
  const offersByIntent = offers.reduce((acc, offer) => {
    if (!acc[offer.intentId]) {
      acc[offer.intentId] = [];
    }
    acc[offer.intentId].push(offer);
    return acc;
  }, {} as Record<number, any[]>);

  const handleAcceptOffer = (offerId: number) => {
    onAcceptOffer(offerId);
    toast({
      title: "Offer Accepted",
      description: "You'll receive a QR code to redeem this offer at the point of sale.",
    });
  };

  const handleRejectOffer = (offerId: number) => {
    onRejectOffer(offerId);
    toast({
      title: "Offer Declined",
      description: "The offer has been declined and removed from your inbox.",
    });
  };

  const handleSendMessage = () => {
    if (!selectedOffer || !messageText.trim()) return;
    
    onMessageCompany(selectedOffer.id, messageText);
    setMessageText("");
    setIsMessageDialogOpen(false);
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the company.",
    });
  };

  const toggleCompareSelection = (offerId: number) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId].slice(0, 3) // Max 3 offers for comparison
    );
  };

  const getOffersForComparison = () => {
    return offers.filter(offer => selectedOffers.includes(offer.id));
  };

  const formatTimeRemaining = (expiresAt: string | Date | null) => {
    if (!expiresAt) return "No expiry";
    
    const now = new Date();
    const expiryDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    
    if (isNaN(expiryDate.getTime())) return "Invalid date";
    
    const timeLeft = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) return "Expired";
    if (daysLeft === 1) return "1 day left";
    return `${daysLeft} days left`;
  };

  const OfferCard = ({ offer, intent, showCompareCheckbox = false }: { offer: any, intent: any, showCompareCheckbox?: boolean }) => (
    <Card className={`hover:shadow-md transition-shadow ${selectedOffers.includes(offer.id) ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            <div>
              <CardTitle className="text-lg">{offer.company}</CardTitle>
              <CardDescription>{offer.product}</CardDescription>
            </div>
          </div>
          {showCompareCheckbox && (
            <input
              type="checkbox"
              checked={selectedOffers.includes(offer.id)}
              onChange={() => toggleCompareSelection(offer.id)}
              className="w-4 h-4"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold text-green-600">${offer.price}</div>
            {offer.originalPrice && offer.originalPrice > offer.price && (
              <div className="text-sm text-gray-500">
                <span className="line-through">${offer.originalPrice}</span>
                <span className="ml-2 text-green-600 font-medium">{offer.discount}</span>
              </div>
            )}
          </div>
          <Badge variant={offer.status === 'pending' ? 'default' : 'secondary'}>
            {offer.status}
          </Badge>
        </div>

        {offer.features && offer.features.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Features:</h4>
            <div className="flex flex-wrap gap-1">
              {offer.features.map((feature: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatTimeRemaining(offer.expiresAt)}</span>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={() => handleAcceptOffer(offer.id)}
            className="flex-1"
            disabled={offer.status !== 'pending'}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleRejectOffer(offer.id)}
            className="flex-1"
            disabled={offer.status !== 'pending'}
          >
            Decline
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedOffer(offer);
              setIsMessageDialogOpen(true);
            }}
            disabled={offer.status !== 'pending'}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ComparisonView = () => {
    const compareOffers = getOffersForComparison();
    if (compareOffers.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Compare Offers ({compareOffers.length})</h3>
          <Button variant="outline" onClick={() => setSelectedOffers([])}>
            Clear Selection
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {compareOffers.map(offer => {
            const intent = intents.find(i => i.id === offer.intentId);
            return (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                intent={intent}
                showCompareCheckbox={true}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Offer Inbox</h2>
        <div className="flex space-x-2">
          <Button 
            variant={compareMode ? "default" : "outline"} 
            onClick={() => setCompareMode(!compareMode)}
          >
            Compare Mode
          </Button>
        </div>
      </div>

      {compareMode && <ComparisonView />}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Offers ({offers.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({offers.filter(o => o.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({offers.filter(o => o.status === 'accepted').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {Object.entries(offersByIntent).map(([intentId, intentOffers]) => {
            const intent = intents.find(i => i.id === parseInt(intentId));
            if (!intent) return null;

            return (
              <div key={intentId} className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold">{intent.title}</h3>
                  <p className="text-sm text-gray-600">
                    Budget: ${intent.budgetMin} - ${intent.budgetMax} • {intent.timeframe}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {intentOffers.length} offer{intentOffers.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {intentOffers.map(offer => (
                    <OfferCard 
                      key={offer.id} 
                      offer={offer} 
                      intent={intent}
                      showCompareCheckbox={compareMode}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers
              .filter(offer => offer.status === 'pending')
              .map(offer => {
                const intent = intents.find(i => i.id === offer.intentId);
                return (
                  <OfferCard 
                    key={offer.id} 
                    offer={offer} 
                    intent={intent}
                    showCompareCheckbox={compareMode}
                  />
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="accepted" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers
              .filter(offer => offer.status === 'accepted')
              .map(offer => {
                const intent = intents.find(i => i.id === offer.intentId);
                return (
                  <OfferCard 
                    key={offer.id} 
                    offer={offer} 
                    intent={intent}
                    showCompareCheckbox={false}
                  />
                );
              })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {selectedOffer?.company}</DialogTitle>
            <DialogDescription>
              Send a message about their offer for {selectedOffer?.product}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ask questions about the offer, request modifications, or provide additional details..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}