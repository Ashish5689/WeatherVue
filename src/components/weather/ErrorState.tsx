import React from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, CloudOff, RefreshCw, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({
  message = "An error occurred while fetching weather data.",
  onRetry = () => {},
}: ErrorStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full p-10 bg-gradient-to-br from-red-50 to-orange-50 backdrop-blur-sm border border-red-100 rounded-xl shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-red-100 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 -ml-10 -mb-10 bg-orange-100 rounded-full opacity-50"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6 relative z-10"
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ 
              scale: [0.8, 1, 0.8],
              rotate: [-10, 0, -10]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-red-100 p-5 rounded-full border-2 border-red-200"
          >
            <CloudOff className="h-14 w-14 text-red-500" />
          </motion.div>
          
          <div className="text-center max-w-md">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h3 className="text-2xl font-medium text-red-800 mb-3 flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Unable to Load Weather Data
              </h3>
            </motion.div>
            
            <motion.p 
              className="text-red-600 mb-6 px-4 py-3 bg-red-100/50 rounded-lg border border-red-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {message}
            </motion.p>
          </div>
          
          <motion.div 
            className="flex flex-col md:flex-row gap-4 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button
              onClick={onRetry}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-5 py-2 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            
            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100 flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search for Another Location
            </Button>
          </motion.div>
          
          <motion.div
            className="mt-6 text-sm text-red-500/80 text-center max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p>
              This could be due to network issues, an invalid location, or temporary service unavailability.
              Please check your internet connection or try again later.
            </p>
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default ErrorState;
