import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertOfferSchema, Intent } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Simplified validation schema for testing
const createOfferSchema = z.object({
  intentId: z.number(),
  company: z.string().min(1, { message: "Company name is required" }),
  product: z.string().min(1, { message: "Product description is required" }),
  price: z.number().min(1, { message: "Price must be at least 1" }),
  originalPrice: z.number().optional().nullable(),
  discount: z.string().optional(),
  expiresAt: z.date().optional().nullable(),
});

interface CreateOfferFormProps {
  isOpen: boolean;
  onClose: () => void;
  intent: Intent;
  onSuccess?: () => void;
}

export function CreateOfferForm({ isOpen, onClose, intent, onSuccess }: CreateOfferFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof createOfferSchema>>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      intentId: intent.id,
      company: "",
      product: "",
      price: undefined,
      originalPrice: null,
      discount: "",
      expiresAt: null,
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createOfferSchema>) => {
      console.log("Sending POST request to /api/offers with values:", values);
      const res = await apiRequest("POST", "/api/offers", values);
      console.log("Response status:", res.status);
      return await res.json();
    },
    onSuccess: (data) => {
      console.log("Offer created successfully:", data);
      toast({
        title: "Offer created",
        description: "Your offer has been sent to the consumer.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/offers"] });
      form.reset();
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      console.error("Failed to create offer:", error);
      toast({
        title: "Failed to create offer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof createOfferSchema>) => {
    console.log("Form submitted with values:", values);
    console.log("Form errors:", form.formState.errors);
    createOfferMutation.mutate(values);
  };

  // Debug form validation
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit attempted");
    console.log("Form is valid:", form.formState.isValid);
    console.log("Form errors:", form.formState.errors);
    console.log("Current form values:", form.getValues());
    form.handleSubmit(onSubmit)(e);
  };

  // Calculate discount percentage if original price and price are provided
  const calculateDiscount = () => {
    const originalPrice = form.watch("originalPrice");
    const price = form.watch("price");
    
    if (originalPrice && price && originalPrice > price) {
      const discountAmount = originalPrice - price;
      const discountPercentage = Math.round((discountAmount / originalPrice) * 100);
      form.setValue("discount", `${discountPercentage}% Off`);
    } else {
      form.setValue("discount", "");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-900">
            Create Offer for "{intent.title}"
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Company Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your company name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Product Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed product description" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="originalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Original Price ($)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="e.g. 1500" 
                        {...field}
                        onChange={e => {
                          field.onChange(e.target.value ? parseInt(e.target.value) : undefined);
                          calculateDiscount();
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Offer Price ($)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="e.g. 1200" 
                        {...field}
                        onChange={e => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : undefined);
                          calculateDiscount();
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Discount Label
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 20% Off" 
                        {...field} 
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Offer Expiration Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-2 mb-4">
              <Button 
                type="button" 
                onClick={() => {
                  console.log("Direct submit test");
                  const testData = {
                    intentId: intent.id,
                    company: "Test Company",
                    product: "Test Product", 
                    price: 100,
                    originalPrice: null,
                    discount: "",
                    expiresAt: null
                  };
                  createOfferMutation.mutate(testData);
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                🧪 Test Submit (Bypass Form)
              </Button>
            </div>

            <DialogFooter className="sm:flex sm:flex-row-reverse gap-2">
              <Button 
                type="submit" 
                disabled={createOfferMutation.isPending}
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700"
              >
                {createOfferMutation.isPending ? "Creating..." : "Submit Offer"}
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
