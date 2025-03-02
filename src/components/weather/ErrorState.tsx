import React from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorStateProps {
  message?: string;
}

const ErrorState = ({
  message = "An error occurred while fetching weather data.",
}: ErrorStateProps) => {
  return (
    <Card className="w-full p-8 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg shadow-lg">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-xl font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600 max-w-md">{message}</p>
        </div>
        <div className="mt-4">
          <p className="text-sm text-red-500">
            Please check your internet connection or try searching for a
            different location.
          </p>
        </div>
      </motion.div>
    </Card>
  );
};

export default ErrorState;
