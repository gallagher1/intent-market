import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertIntentSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Extend the insert schema with validation
const createIntentSchema = insertIntentSchema.extend({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  timeframe: z.string().min(1, { message: "Please select a timeframe" }),
  budgetMin: z.number().min(1, { message: "Please enter a minimum budget" }).optional(),
  budgetMax: z.number().min(1, { message: "Please enter a maximum budget" }).optional(),
  features: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
}).omit({ userId: true });

interface CreateIntentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateIntentForm({ isOpen, onClose, onSuccess }: CreateIntentFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [featuresInput, setFeaturesInput] = useState("");
  const [brandsInput, setBrandsInput] = useState("");

  const form = useForm<z.infer<typeof createIntentSchema>>({
    resolver: zodResolver(createIntentSchema),
    defaultValues: {
      title: "",
      timeframe: "",
      budgetMin: undefined,
      budgetMax: undefined,
      features: [],
      brands: [],
    },
  });

  const createIntentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createIntentSchema>) => {
      const payload = {
        ...values,
        userId: user?.id,
      };
      const res = await apiRequest("POST", "/api/intents", payload);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Intent created",
        description: "Your purchase intent has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/intents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      form.reset();
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create intent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof createIntentSchema>) => {
    // Convert the comma-separated features and brands to arrays
    const features = featuresInput.length > 0 
      ? featuresInput.split(",").map(item => item.trim()) 
      : [];
    
    const brands = brandsInput.length > 0 
      ? brandsInput.split(",").map(item => item.trim()) 
      : [];
    
    createIntentMutation.mutate({
      ...values,
      features,
      brands,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-900">
            Create New Purchase Intent
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    What are you looking to purchase?
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Refrigerator, Laptop, Sectional Sofa" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="timeframe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    When are you planning to purchase?
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a timeframe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Within 1 week">Within 1 week</SelectItem>
                      <SelectItem value="Within 2 weeks">Within 2 weeks</SelectItem>
                      <SelectItem value="Within 3 weeks">Within 3 weeks</SelectItem>
                      <SelectItem value="Within 1 month">Within 1 month</SelectItem>
                      <SelectItem value="Within 3 months">Within 3 months</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="block text-sm font-medium text-gray-700">
                Budget range
              </FormLabel>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budgetMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <Input 
                            type="number"
                            placeholder="Min" 
                            className="pl-7"
                            {...field}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budgetMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <Input 
                            type="number"
                            placeholder="Max" 
                            className="pl-7"
                            {...field}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div>
              <FormLabel className="block text-sm font-medium text-gray-700">
                Desired features (optional)
              </FormLabel>
              <div className="mt-1">
                <Textarea 
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  rows={3} 
                  placeholder="List specific features you're looking for (separate with commas)" 
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Separate features with commas. The more specific you are, the better offers you'll receive.
              </p>
            </div>
            
            <div>
              <FormLabel className="block text-sm font-medium text-gray-700">
                Preferred brands (optional)
              </FormLabel>
              <div className="mt-1">
                <Input 
                  value={brandsInput}
                  onChange={(e) => setBrandsInput(e.target.value)}
                  placeholder="e.g. Samsung, LG, Whirlpool" 
                />
              </div>
            </div>
            
            <DialogFooter className="sm:flex sm:flex-row-reverse gap-2">
              <Button 
                type="submit" 
                disabled={createIntentMutation.isPending}
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700"
              >
                {createIntentMutation.isPending ? "Creating..." : "Create Intent"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="mt-3 sm:mt-0 w-full sm:w-auto"
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
