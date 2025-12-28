import { Globe, Building2, Plane, ArrowRight } from "lucide-react";

interface TransactionRouteProps {
  originCountry?: string;
  destinationCountry?: string;
}

export function TransactionRoute({
  originCountry = "Unknown",
  destinationCountry = "US",
}: TransactionRouteProps) {
  const origin = originCountry || "Unknown";
  const isCrossBorder = origin !== destinationCountry;

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 rounded-full border border-blue-100">
          <Globe className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
            Origin
          </p>
          <p className="font-medium text-slate-900">{origin}</p>
        </div>
      </div>

      <div className="flex-1 mx-6 flex flex-col items-center relative">
        {/* Line */}
        <div className="w-full h-px bg-slate-200 absolute top-1/2 -translate-y-1/2"></div>

        {/* Arrow pointing right */}
        <div className="absolute top-1/2 -translate-y-1/2 bg-white px-2">
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </div>

        {/* Badge */}
        <span
          className={`relative z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border mt-12 ${
            isCrossBorder
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-slate-50 text-slate-500 border-slate-100"
          }`}
        >
          {isCrossBorder ? "Cross-Border" : "Domestic"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
            Destination
          </p>
          <p className="font-medium text-slate-900">United States</p>
        </div>
        <div className="p-2.5 bg-emerald-50 rounded-full border border-emerald-100">
          <Building2 className="h-5 w-5 text-emerald-600" />
        </div>
      </div>
    </div>
  );
}
