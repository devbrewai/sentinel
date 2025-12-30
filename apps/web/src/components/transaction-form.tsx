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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionRequest } from "@/types";
import { useState } from "react";

const formSchema = z.object({
  TransactionAmt: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  card_id: z.string().min(1, "Card ID is required"),
  sender_name: z.string().min(1, "Sender name is required"),
  sender_country: z.string().optional(),
  ProductCD: z.string().optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionRequest) => void;
  isLoading: boolean;
}

export function TransactionForm({ onSubmit, isLoading }: TransactionFormProps) {
  const [activeTab, setActiveTab] = useState("safe");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      TransactionAmt: 45.5,
      card_id: "card_valid_999",
      sender_name: "Sarah Smith",
      sender_country: "US",
      ProductCD: "W",
    },
  });

  const fillPreset = (preset: string) => {
    setActiveTab(preset);
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
        sender_country: "Cuba",
        ProductCD: "C",
      });
    } else if (preset === "risky") {
      form.reset({
        TransactionAmt: 9500.0,
        card_id: "card_risk_007",
        sender_name: "Suspicious user",
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

    // Logic for feature injection remains same
    if (values.TransactionAmt === 1200.0 && values.card_id === "card_reg_99") {
      payload["V258"] = 8.0;
      payload["C1"] = 15.0;
      payload["C14"] = 2.0;
      payload["V45"] = 12.0;
      payload["C13"] = 3.0;
    }

    if (
      values.TransactionAmt === 9500.0 &&
      values.card_id === "card_risk_007"
    ) {
      payload["V258"] = 12.0;
      payload["C1"] = 22.0;
      payload["C14"] = 0.0;
      payload["V45"] = 20.0;
      payload["V87"] = 22.0;
      payload["C13"] = 0.0;
      payload["V83"] = 3.0;
      payload["V201"] = 19.0;
    }

    onSubmit(payload);
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
          Submit transaction
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 mb-4">
          Enter transaction details to screen
        </CardDescription>

        <Tabs value={activeTab} onValueChange={fillPreset} className="w-full">
          <TabsList>
            <TabsTrigger value="safe">Safe</TabsTrigger>
            <TabsTrigger value="sanctions">Sanctions hit</TabsTrigger>
            <TabsTrigger value="risky">High risk</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-6 pt-4">
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Amount
                  </FormLabel>
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Sender name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
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
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Card ID
                    </FormLabel>
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
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Country
                    </FormLabel>
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Product code
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xs">
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
              className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Analyze transaction"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
