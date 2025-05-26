import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CreateIntentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateIntent: (intent: any) => void;
}

export function CreateIntentDialog({ isOpen, onClose, onCreateIntent }: CreateIntentDialogProps) {
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [brandsText, setBrandsText] = useState("");
  
  // Form validation
  const [titleError, setTitleError] = useState("");
  const [timeframeError, setTimeframeError] = useState("");
  const [budgetError, setBudgetError] = useState("");

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setTitleError("");
    setTimeframeError("");
    setBudgetError("");
    
    // Validate title
    if (!title.trim()) {
      setTitleError("Title is required");
      isValid = false;
    }
    
    // Validate timeframe
    if (!timeframe.trim()) {
      setTimeframeError("Timeframe is required");
      isValid = false;
    }
    
    // Validate budget
    const minBudget = parseFloat(budgetMin);
    const maxBudget = parseFloat(budgetMax);
    
    if (isNaN(minBudget) || isNaN(maxBudget)) {
      setBudgetError("Both minimum and maximum budget are required");
      isValid = false;
    } else if (minBudget >= maxBudget) {
      setBudgetError("Maximum budget must be greater than minimum budget");
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Parse features and brands into arrays
    const features = featuresText
      .split(",")
      .map(item => item.trim())
      .filter(item => item !== "");
      
    const brands = brandsText
      .split(",")
      .map(item => item.trim())
      .filter(item => item !== "");
    
    // Create new intent object
    const newIntent = {
      id: Date.now(), // Using timestamp as temporary ID
      title,
      timeframe,
      budgetMin: parseFloat(budgetMin),
      budgetMax: parseFloat(budgetMax),
      features,
      brands,
      status: "active",
      createdAt: new Date(),
    };
    
    // Call parent handler
    onCreateIntent(newIntent);
    
    // Show success toast
    toast({
      title: "Intent Created",
      description: "Your purchase intent has been created successfully.",
    });
    
    // Reset form and close dialog
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setTitle("");
    setTimeframe("");
    setBudgetMin("");
    setBudgetMax("");
    setFeaturesText("");
    setBrandsText("");
    setTitleError("");
    setTimeframeError("");
    setBudgetError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Intent</DialogTitle>
          <DialogDescription>
            Define what you're looking to purchase and your requirements.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gaming Laptop, Refrigerator, Standing Desk"
              className={titleError ? "border-red-500" : ""}
            />
            {titleError && <p className="text-red-500 text-sm">{titleError}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeframe">Purchase Timeframe</Label>
            <Input
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="e.g. Within 2 weeks, Next month, Before August"
              className={timeframeError ? "border-red-500" : ""}
            />
            {timeframeError && <p className="text-red-500 text-sm">{timeframeError}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Budget Range</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="budgetMin" className="text-sm text-gray-500">Minimum ($)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  min="0"
                  step="any"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="Min"
                  className={budgetError ? "border-red-500" : ""}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="budgetMax" className="text-sm text-gray-500">Maximum ($)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  min="0"
                  step="any"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="Max"
                  className={budgetError ? "border-red-500" : ""}
                />
              </div>
            </div>
            {budgetError && <p className="text-red-500 text-sm">{budgetError}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="features">
              Desired Features <span className="text-sm text-gray-500">(separated by commas)</span>
            </Label>
            <Textarea
              id="features"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="e.g. 16GB RAM, Energy Star, Height Adjustable"
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brands">
              Preferred Brands <span className="text-sm text-gray-500">(separated by commas)</span>
            </Label>
            <Textarea
              id="brands"
              value={brandsText}
              onChange={(e) => setBrandsText(e.target.value)}
              placeholder="e.g. Samsung, LG, ASUS"
              className="resize-none"
              rows={2}
            />
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="mt-2">
              Cancel
            </Button>
            <Button type="submit" className="mt-2">
              Create Intent
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}