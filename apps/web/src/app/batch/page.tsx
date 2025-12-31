"use client";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { scoreBatchTransactions } from "@/lib/api";
import { BatchResultItem, BatchTransactionItem } from "@/types";

function parseCSV(text: string): BatchTransactionItem[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must have a header row and at least one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  // Map expected column names to their indices
  const colMap: Record<string, number> = {};
  const columnMappings: Record<string, string[]> = {
    transaction_id: ["transaction_id", "txn_id", "id"],
    sender_name: ["sender_name", "name", "sender"],
    transaction_amt: ["transactionamt", "amount", "transaction_amt", "amt"],
    card_id: ["card_id", "cardid", "card"],
    sender_country: ["sender_country", "country"],
    product_cd: ["productcd", "product_cd", "product"],
  };

  for (const [field, aliases] of Object.entries(columnMappings)) {
    const idx = headers.findIndex((h) => aliases.includes(h));
    if (idx !== -1) colMap[field] = idx;
  }

  // Validate required columns
  const required = ["transaction_id", "sender_name", "transaction_amt", "card_id"];
  const missing = required.filter((f) => colMap[f] === undefined);
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(", ")}`);
  }

  const transactions: BatchTransactionItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles basic cases)
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));

    const amt = parseFloat(values[colMap.transaction_amt]);
    if (isNaN(amt) || amt <= 0) {
      throw new Error(`Invalid amount on row ${i + 1}: ${values[colMap.transaction_amt]}`);
    }

    transactions.push({
      transaction_id: values[colMap.transaction_id],
      sender_name: values[colMap.sender_name],
      TransactionAmt: amt,
      card_id: values[colMap.card_id],
      sender_country: colMap.sender_country !== undefined ? values[colMap.sender_country] : undefined,
      ProductCD: colMap.product_cd !== undefined ? values[colMap.product_cd] : undefined,
    });
  }

  if (transactions.length === 0) {
    throw new Error("No valid transactions found in CSV");
  }

  if (transactions.length > 100) {
    throw new Error("Maximum 100 transactions per batch. Please split your file.");
  }

  return transactions;
}

export default function BatchPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchResultItem[] | null>(null);
  const [screenedAt, setScreenedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile?.type === "text/csv" ||
      droppedFile?.name.endsWith(".csv")
    ) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const transactions = parseCSV(text);
      const response = await scoreBatchTransactions({ transactions });
      setScreenedAt(new Date().toISOString());
      setResults(response.results);
    } catch (err: any) {
      setError(err.message || "Failed to process batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
    setScreenedAt(null);
    setError(null);
  };

  const handleExportCSV = () => {
    if (!results) return;

    // CSV headers
    const headers = [
      "Transaction ID",
      "Sender Name",
      "Amount (USD)",
      "Risk Score (%)",
      "Risk Level",
      "Decision",
      "Sanctions Match",
      "Screened At",
    ];

    // CSV rows
    const rows = results.map((row) => [
      row.transaction_id,
      `"${row.sender_name.replace(/"/g, '""')}"`, // Quote names and escape double quotes per RFC 4180
      row.amount.toFixed(2),
      (row.risk_score * 100).toFixed(1),
      row.risk_level.toUpperCase(),
      row.decision.toUpperCase(),
      row.sanctions_match ? "YES" : "NO",
      screenedAt ?? new Date().toISOString(),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `batch-screening-results-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRiskBadgeClass = (level: string) => {
    const styles = {
      low: "bg-emerald-50 text-emerald-700 border-emerald-200",
      medium: "bg-amber-50 text-amber-700 border-amber-200",
      high: "bg-orange-50 text-orange-700 border-orange-200",
      critical: "bg-red-50 text-red-700 border-red-200",
    };
    return styles[level as keyof typeof styles] || styles.low;
  };

  const getDecisionBadgeClass = (decision: string) => {
    const styles = {
      approve: "bg-emerald-50 text-emerald-700 border-emerald-200",
      review: "bg-amber-50 text-amber-700 border-amber-200",
      reject: "bg-red-50 text-red-700 border-red-200",
    };
    return styles[decision as keyof typeof styles] || styles.review;
  };

  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Batch screening
          </h1>
          <p className="text-gray-500 mt-1">
            Upload a CSV file to screen multiple transactions at once
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!results ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xs">
              <div className="p-5 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  Upload Transactions
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Drag and drop a CSV file or click to browse
                </p>
              </div>
              <div className="p-5">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xs p-10 text-center transition-colors ${
                    isDragging
                      ? "border-gray-400 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {file ? (
                    <div className="space-y-4">
                      <div className="w-12 h-12 mx-auto bg-emerald-50 rounded-xs flex items-center justify-center">
                        <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <div className="flex justify-center gap-3">
                        <Button onClick={handleProcess} disabled={isProcessing}>
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Process File"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          disabled={isProcessing}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-xs flex items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Drop your CSV file here
                        </p>
                        <p className="text-sm text-gray-500">
                          or click to browse
                        </p>
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
              </div>
            </div>

            {/* Format Info */}
            <div className="bg-white border border-gray-200 rounded-xs">
              <div className="p-5 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">CSV Format</h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Required columns:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-xs">
                      transaction_id
                    </li>
                    <li className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-xs">
                      sender_name
                    </li>
                    <li className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-xs">
                      TransactionAmt
                    </li>
                    <li className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-xs">
                      card_id
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Optional columns:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-xs">
                      sender_country
                    </li>
                    <li className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-xs">
                      ProductCD
                    </li>
                  </ul>
                </div>
                <a
                  href="/assets/sample-transactions.csv"
                  download
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Download sample CSV
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-xs p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-xs">
                    <ArrowRightLeft className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Processed</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {results.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xs p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xs">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Approved</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {results.filter((r) => r.decision === "approve").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xs p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-xs">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Review</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {results.filter((r) => r.decision === "review").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xs p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-xs">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rejected</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {results.filter((r) => r.decision === "reject").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white border border-gray-200 rounded-xs">
              <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Results</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {results.length} transactions processed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-1.5" />
                    Export CSV
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    New Batch
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-600 font-medium">
                        Transaction ID
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium">
                        Sender
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium text-right">
                        Risk Score
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium">
                        Risk Level
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium">
                        Decision
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium">
                        Sanctions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((row) => (
                      <TableRow
                        key={row.transaction_id}
                        className="border-gray-200"
                      >
                        <TableCell className="font-mono text-sm text-gray-900">
                          {row.transaction_id}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {row.sender_name}
                        </TableCell>
                        <TableCell className="text-right font-mono text-gray-900">
                          ${row.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-gray-900">
                          {(row.risk_score * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getRiskBadgeClass(
                              row.risk_level
                            )}`}
                          >
                            {row.risk_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs uppercase ${getDecisionBadgeClass(
                              row.decision
                            )}`}
                          >
                            {row.decision}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {row.sanctions_match ? (
                            <span className="flex items-center gap-1.5 text-red-600 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              Match
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-emerald-600 text-sm">
                              <CheckCircle2 className="h-4 w-4" />
                              Clear
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
