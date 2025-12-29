"use client";

import { useState } from "react";
import { FileDown, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreResponse, TransactionRequest } from "@/types";
import jsPDF from "jspdf";

interface ComplianceReportProps {
  request: TransactionRequest;
  response: ScoreResponse;
}

// Human-readable feature name mapping
const FEATURE_LABELS: Record<string, string> = {
  TransactionAmt: "Transaction Amount",
  "card1_txn_1.0h": "Transactions (1 hour)",
  "card1_txn_24.0h": "Transactions (24 hours)",
  ProductCD: "Product Code",
  V258: "Velocity Pattern V258",
  V201: "Velocity Pattern V201",
  V317: "Risk Signal V317",
  C1: "Count Aggregation C1",
  C14: "Count Aggregation C14",
  D1: "Time Delta D1",
  D15: "Time Delta D15",
};

function getFeatureLabel(name: string): string {
  return FEATURE_LABELS[name] || name;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function generateReportId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RPT-${timestamp}-${random}`;
}

export function ComplianceReport({
  request,
  response,
}: ComplianceReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    setIsComplete(false);

    try {
      const doc = new jsPDF();
      const reportId = generateReportId();
      const generatedAt = new Date().toISOString();
      const pageWidth = doc.internal.pageSize.getWidth();

      let yPos = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Sentinel AI", 20, yPos);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Compliance Screening Report", 20, yPos + 7);

      // Report ID and timestamp on the right
      doc.setFontSize(9);
      doc.text(`Report ID: ${reportId}`, pageWidth - 20, yPos, {
        align: "right",
      });
      doc.text(
        `Generated: ${new Date(generatedAt).toLocaleString()}`,
        pageWidth - 20,
        yPos + 5,
        { align: "right" }
      );

      yPos += 20;

      // Horizontal line
      doc.setDrawColor(200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 15;

      // Decision Summary Box
      const decisionColor =
        response.decision === "approve"
          ? [34, 197, 94] // green
          : response.decision === "reject"
          ? [239, 68, 68] // red
          : [245, 158, 11]; // amber

      doc.setFillColor(decisionColor[0], decisionColor[1], decisionColor[2]);
      doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, "F");

      doc.setTextColor(255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`DECISION: ${response.decision.toUpperCase()}`, 30, yPos + 10);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Risk Level: ${response.risk_level.toUpperCase()} | Risk Score: ${(
          response.risk_score * 100
        ).toFixed(1)}% | Sanctions: ${
          response.sanctions_match ? "MATCH FOUND" : "CLEAR"
        }`,
        30,
        yPos + 18
      );

      yPos += 35;

      // Transaction Details Section
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Transaction Details", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);

      const txnDetails = [
        ["Transaction ID", response.transaction_id],
        ["Amount", formatCurrency(request.TransactionAmt)],
        ["Sender Name", request.sender_name],
        ["Sender Country", request.sender_country || "Not specified"],
        ["Card ID", request.card_id],
        ["Product Code", request.ProductCD || "Not specified"],
        ["Processing Time", `${response.latency_ms.toFixed(0)}ms`],
      ];

      txnDetails.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, 25, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(String(value), 80, yPos);
        yPos += 6;
      });

      yPos += 10;

      // Risk Assessment Section
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Risk Assessment", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);

      // Risk score bar
      const barWidth = 100;
      const barHeight = 8;
      const scoreWidth = response.risk_score * barWidth;

      doc.setFillColor(229, 231, 235); // gray-200
      doc.roundedRect(25, yPos, barWidth, barHeight, 2, 2, "F");

      const riskColor =
        response.risk_level === "low"
          ? [34, 197, 94]
          : response.risk_level === "medium"
          ? [245, 158, 11]
          : [239, 68, 68];

      doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.roundedRect(25, yPos, scoreWidth, barHeight, 2, 2, "F");

      doc.text(
        `${(response.risk_score * 100).toFixed(1)}%`,
        barWidth + 35,
        yPos + 6
      );

      yPos += 18;

      // Top contributing features
      if (response.top_features && response.top_features.length > 0) {
        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Top Risk Factors (SHAP Analysis)", 25, yPos);
        yPos += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);

        response.top_features.slice(0, 5).forEach((feature, idx) => {
          const contribution = feature.contribution;
          const direction = contribution > 0 ? "↑ increases" : "↓ decreases";
          const absContrib = Math.abs(contribution).toFixed(2);

          doc.text(
            `${idx + 1}. ${getFeatureLabel(feature.name)}: ${direction} risk by ${absContrib}`,
            30,
            yPos
          );
          yPos += 5;
        });

        yPos += 5;
      }

      yPos += 5;

      // Sanctions Screening Section
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Sanctions Screening (OFAC)", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);

      if (response.sanctions_details) {
        doc.text(`Query: "${response.sanctions_details.query}"`, 25, yPos);
        yPos += 6;

        if (
          response.sanctions_details.top_matches &&
          response.sanctions_details.top_matches.length > 0
        ) {
          doc.setFont("helvetica", "bold");
          doc.text("Top Matches:", 25, yPos);
          yPos += 6;

          doc.setFont("helvetica", "normal");
          response.sanctions_details.top_matches.forEach((match, idx) => {
            const matchStatus = match.is_match ? "⚠ MATCH" : "○ No match";
            doc.text(
              `${idx + 1}. ${match.match_name} - Score: ${(
                match.score * 100
              ).toFixed(1)}% ${matchStatus}`,
              30,
              yPos
            );
            yPos += 5;

            if (match.program) {
              doc.setTextColor(100);
              doc.text(`   Program: ${match.program}`, 30, yPos);
              doc.setTextColor(60);
              yPos += 5;
            }
          });
        } else {
          doc.text("No potential matches found in OFAC lists.", 25, yPos);
          yPos += 6;
        }
      } else {
        doc.text(
          response.sanctions_match
            ? "Sanctions match detected."
            : "No sanctions matches detected.",
          25,
          yPos
        );
        yPos += 6;
      }

      yPos += 15;

      // Footer
      doc.setDrawColor(200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        "This report is generated automatically by Sentinel AI for compliance and audit purposes.",
        20,
        yPos
      );
      yPos += 4;
      doc.text(
        "Screening includes fraud risk scoring via ML model and sanctions screening against OFAC SDN/Consolidated lists.",
        20,
        yPos
      );
      yPos += 6;
      doc.text(`Report ID: ${reportId}`, 20, yPos);

      // Save the PDF
      const filename = `compliance-report-${response.transaction_id}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(filename);

      setIsComplete(true);
      setTimeout(() => setIsComplete(false), 2000);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generatePDF}
      disabled={isGenerating}
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : isComplete ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          Downloaded
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}

