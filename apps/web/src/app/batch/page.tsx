"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BatchResult {
  transaction_id: string;
  sender_name: string;
  amount: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  decision: "approve" | "review" | "reject";
  sanctions_match: boolean;
}

// Demo data for UI showcase
const DEMO_RESULTS: BatchResult[] = [
  { transaction_id: "TXN-001", sender_name: "John Smith", amount: 1500.00, risk_score: 0.12, risk_level: "low", decision: "approve", sanctions_match: false },
  { transaction_id: "TXN-002", sender_name: "Maria Garcia", amount: 25000.00, risk_score: 0.45, risk_level: "medium", decision: "review", sanctions_match: false },
  { transaction_id: "TXN-003", sender_name: "Alex Johnson", amount: 500.00, risk_score: 0.08, risk_level: "low", decision: "approve", sanctions_match: false },
  { transaction_id: "TXN-004", sender_name: "Kim Jong", amount: 75000.00, risk_score: 0.89, risk_level: "critical", decision: "reject", sanctions_match: true },
  { transaction_id: "TXN-005", sender_name: "Sarah Williams", amount: 3200.00, risk_score: 0.22, risk_level: "low", decision: "approve", sanctions_match: false },
];

export default function BatchPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult[] | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "text/csv" || droppedFile?.name.endsWith(".csv")) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    // Simulate API call - in production, this would POST to /api/v1/batch
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setResults(DEMO_RESULTS);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
  };

  const getRiskBadge = (level: string) => {
    const styles = {
      low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
      high: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
      critical: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    };
    return styles[level as keyof typeof styles] || styles.low;
  };

  const getDecisionBadge = (decision: string) => {
    const styles = {
      approve: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      review: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
      reject: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    };
    return styles[decision as keyof typeof styles] || styles.review;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Batch Screening
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Upload a CSV file to screen multiple transactions at once
          </p>
        </div>

        {!results ? (
          <>
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Transactions</CardTitle>
                <CardDescription>
                  Upload a CSV file with transaction data. Required columns: transaction_id, sender_name, TransactionAmt, card_id
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  {file ? (
                    <div className="space-y-4">
                      <FileSpreadsheet className="h-12 w-12 mx-auto text-green-500" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{file.name}</p>
                        <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div className="flex justify-center gap-3">
                        <Button onClick={handleProcess} disabled={isProcessing}>
                          {isProcessing ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Process File"
                          )}
                        </Button>
                        <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          Drop your CSV file here
                        </p>
                        <p className="text-sm text-slate-500">or click to browse</p>
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button variant="outline" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Select File
                        </label>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sample Format */}
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertDescription>
                <strong>CSV Format:</strong> transaction_id, sender_name, TransactionAmt, card_id, sender_country (optional), ProductCD (optional)
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <>
            {/* Results Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{results.length}</div>
                  <p className="text-sm text-muted-foreground">Total Processed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {results.filter((r) => r.decision === "approve").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">
                    {results.filter((r) => r.decision === "review").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Review</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">
                    {results.filter((r) => r.decision === "reject").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </CardContent>
              </Card>
            </div>

            {/* Results Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Results</CardTitle>
                <Button variant="outline" onClick={handleReset}>
                  New Batch
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Risk Score</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Sanctions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((row) => (
                      <TableRow key={row.transaction_id}>
                        <TableCell className="font-mono text-sm">{row.transaction_id}</TableCell>
                        <TableCell>{row.sender_name}</TableCell>
                        <TableCell className="text-right font-mono">
                          ${row.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(row.risk_score * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRiskBadge(row.risk_level)}>
                            {row.risk_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getDecisionBadge(row.decision)}>
                            {row.decision}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {row.sanctions_match ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
