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
  {
    transaction_id: "TXN-001",
    sender_name: "John Smith",
    amount: 1500.0,
    risk_score: 0.12,
    risk_level: "low",
    decision: "approve",
    sanctions_match: false,
  },
  {
    transaction_id: "TXN-002",
    sender_name: "Maria Garcia",
    amount: 25000.0,
    risk_score: 0.45,
    risk_level: "medium",
    decision: "review",
    sanctions_match: false,
  },
  {
    transaction_id: "TXN-003",
    sender_name: "Alex Johnson",
    amount: 500.0,
    risk_score: 0.08,
    risk_level: "low",
    decision: "approve",
    sanctions_match: false,
  },
  {
    transaction_id: "TXN-004",
    sender_name: "Kim Jong",
    amount: 75000.0,
    risk_score: 0.89,
    risk_level: "critical",
    decision: "reject",
    sanctions_match: true,
  },
  {
    transaction_id: "TXN-005",
    sender_name: "Sarah Williams",
    amount: 3200.0,
    risk_score: 0.22,
    risk_level: "low",
    decision: "approve",
    sanctions_match: false,
  },
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
      setFile(selectedFile);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setResults(DEMO_RESULTS);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
  };

  const getRiskBadgeClass = (level: string) => {
    const styles = {
      low: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
      medium:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
      high: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
      critical:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
    };
    return styles[level as keyof typeof styles] || styles.low;
  };

  const getDecisionBadgeClass = (decision: string) => {
    const styles = {
      approve:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
      review:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
      reject:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
    };
    return styles[decision as keyof typeof styles] || styles.review;
  };

  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Batch Screening
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Upload a CSV file to screen multiple transactions at once
          </p>
        </div>

        {!results ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  Upload Transactions
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Drag and drop a CSV file or click to browse
                </p>
              </div>
              <div className="p-5">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-md p-10 text-center transition-colors ${
                    isDragging
                      ? "border-slate-400 bg-slate-50 dark:bg-slate-800/50"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {file ? (
                    <div className="space-y-4">
                      <div className="w-12 h-12 mx-auto bg-emerald-50 dark:bg-emerald-950 rounded-md flex items-center justify-center">
                        <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {file.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
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
                      <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                        <Upload className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          Drop your CSV file here
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  CSV Format
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Required columns:
                  </p>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      transaction_id
                    </li>
                    <li className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      sender_name
                    </li>
                    <li className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      TransactionAmt
                    </li>
                    <li className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      card_id
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Optional columns:
                  </p>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      sender_country
                    </li>
                    <li className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      ProductCD
                    </li>
                  </ul>
                </div>
                <a
                  href="/assets/sample-transactions.csv"
                  download
                  className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                    <ArrowRightLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Processed
                    </p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {results.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-md">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Approved
                    </p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {results.filter((r) => r.decision === "approve").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-md">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Review
                    </p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {results.filter((r) => r.decision === "review").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-950 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Rejected
                    </p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {results.filter((r) => r.decision === "reject").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                    Results
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {results.length} transactions processed
                  </p>
                </div>
                <Button variant="outline" onClick={handleReset}>
                  New Batch
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-800">
                      <TableHead className="text-slate-600 dark:text-slate-400 font-medium">
                        Transaction ID
                      </TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400 font-medium">
                        Sender
                      </TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400 font-medium text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400 font-medium text-right">
                        Risk Score
                      </TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400 font-medium">
                        Risk Level
                      </TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400 font-medium">
                        Decision
                      </TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400 font-medium">
                        Sanctions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((row) => (
                      <TableRow
                        key={row.transaction_id}
                        className="border-slate-200 dark:border-slate-800"
                      >
                        <TableCell className="font-mono text-sm text-slate-900 dark:text-slate-100">
                          {row.transaction_id}
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">
                          {row.sender_name}
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-900 dark:text-slate-100">
                          ${row.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-900 dark:text-slate-100">
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
                            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              Match
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm">
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
