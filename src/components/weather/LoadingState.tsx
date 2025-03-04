import React from "react";
import { Card } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({
  message = "Fetching weather data...",
}: LoadingStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full h-full p-10 flex flex-col items-center justify-center bg-gradient-to-br from-white/40 to-blue-50/40 backdrop-blur-md border border-white/40 rounded-xl shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="relative">
            <motion.div
              className="absolute"
              initial={{ opacity: 0.7 }}
              animate={{ 
                y: [0, -15, 0],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <Sun className="h-16 w-16 text-yellow-400" />
            </motion.div>
          
            <motion.div
              animate={{ 
                x: [-5, 15, -5],
                y: [0, 5, 0]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <Cloud className="h-24 w-24 text-white" />
            </motion.div>
            
            <motion.div
              className="absolute top-12 left-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-10 w-10 text-blue-500" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center"
          >
            <h3 className="text-xl font-medium mb-3 text-slate-800">{message}</h3>
            <p className="text-slate-600 max-w-md">
              We're gathering the latest weather information for your location.
              This should only take a moment.
            </p>
          </motion.div>

          <motion.div
            className="flex gap-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {[0, 1, 2, 0, 1, 2].map((i, index) => (
              <motion.div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index < 3 ? "bg-blue-400" : "bg-blue-300"
                }`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
                
          <motion.div 
            className="mt-6 w-64 h-2 bg-slate-200 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 2.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default LoadingState;
