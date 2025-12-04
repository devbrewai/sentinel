"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionRequest } from "@/types";

const formSchema = z.object({
  TransactionAmt: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  card_id: z.string().min(1, "Card ID is required"),
  sender_name: z.string().min(1, "Sender Name is required"),
  sender_country: z.string().optional(),
  ProductCD: z.string().optional(),
});

// Explicitly define the type to match what useForm expects
type FormSchemaType = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionRequest) => void;
  isLoading: boolean;
}

export function TransactionForm({ onSubmit, isLoading }: TransactionFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      TransactionAmt: 100.0,
      card_id: "card_12345",
      sender_name: "John Doe",
      sender_country: "US",
      ProductCD: "W",
    },
  });

  const fillPreset = (preset: "safe" | "sanctions" | "risky") => {
    if (preset === "safe") {
      form.reset({
        TransactionAmt: 45.5,
        card_id: "card_valid_999",
        sender_name: "Sarah Smith",
        sender_country: "US",
        ProductCD: "W",
      });
    } else if (preset === "sanctions") {
      form.reset({
        TransactionAmt: 1200.0,
        card_id: "card_reg_99",
        sender_name: "AEROCARIBBEAN AIRLINES",
        sender_country: "Cuba", // Changed from CU to Cuba to match dataset
        ProductCD: "C",
      });
    } else if (preset === "risky") {
      form.reset({
        TransactionAmt: 9500.0,
        card_id: "card_risk_007",
        sender_name: "Suspicious User",
        sender_country: "XX",
        ProductCD: "H",
      });
    }
  };

  function handleSubmit(values: FormSchemaType) {
    const payload: TransactionRequest = {
      transaction_id: `txn_${Math.floor(Math.random() * 1000000)}`,
      ...values,
    };
    // Inject high-risk features if it's the risky case (detected by card_id or amount)
    if (
      values.TransactionAmt === 9500.0 &&
      values.card_id === "card_risk_007"
    ) {
      payload["V258"] = 5.0;
      payload["V294"] = 100.0;
      payload["C14"] = 5.0;
      payload["C8"] = 10.0;
    }

    onSubmit(payload);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Submit Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fillPreset("safe")}
          >
            Safe
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fillPreset("sanctions")}
          >
            Sanctions Hit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fillPreset("risky")}
          >
            High Risk
          </Button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="TransactionAmt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value as number}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sender_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="card_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card ID</FormLabel>
                    <FormControl>
                      <Input placeholder="card_..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sender_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="CU">Cuba (ISO)</SelectItem>
                        <SelectItem value="Cuba">Cuba (Full)</SelectItem>
                        <SelectItem value="MX">Mexico</SelectItem>
                        <SelectItem value="CO">Colombia</SelectItem>
                        <SelectItem value="XX">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ProductCD"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Code</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="W">W (Web)</SelectItem>
                      <SelectItem value="H">H (Mobile)</SelectItem>
                      <SelectItem value="C">C (Credit)</SelectItem>
                      <SelectItem value="R">R (Retail)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? "Analyzing..." : "Analyze Transaction"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
