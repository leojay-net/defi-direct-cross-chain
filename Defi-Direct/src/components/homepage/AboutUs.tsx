"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaWallet, FaCoins, FaDollarSign, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";

const steps = [
  { id: 1, title: "Connect Wallet", icon: <FaWallet /> },
  { id: 2, title: "Choose Stable Coin", icon: <FaCoins /> },
  { id: 3, title: "Enter Amount", icon: <FaDollarSign /> },
  { id: 4, title: "Confirm Transfer", icon: <FaCheckCircle /> },
  { id: 5, title: "Receive Payment", icon: <FaMoneyBillWave /> },
];

const ProductProcess = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center py-8 sm:py-12 md:py-16 text-white my-6 sm:my-8 md:my-10 mx-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-8 md:mb-12 lg:mb-20">How It Works</h1>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center w-full max-w-5xl gap-6 sm:gap-8 md:gap-10 mb-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={
              activeStep === index
                ? { scale: 1.1, opacity: 1, y: -5 }
                : { scale: 1, opacity: 0.6, y: 0 }
            }
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 10,
            }}
            className="flex flex-col items-center space-y-2 sm:space-y-3 relative min-w-[120px] sm:min-w-[140px]"
          >
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full text-xl sm:text-2xl md:text-3xl transition-all duration-300 ${activeStep === index
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-xl"
                  : "bg-gray-700"
                } text-white`}
            >
              {step.icon}
            </div>
            <p className="text-sm sm:text-base md:text-lg font-semibold text-center">{step.title}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductProcess;
