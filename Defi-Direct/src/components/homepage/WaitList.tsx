"use client";

import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import axios from "axios";
import { AxiosError } from "axios";

function WaitList() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Please enter a valid email.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://backend-cf8a.onrender.com/waitlistapi/waitlist/",
        { "email": email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setMessage("Successfully joined the waitlist");
        setEmail("");
      } else {
        setMessage("Failed to save email. Please try again.");
      }
    } catch (error) {
      if (error) {
        let message = 'Unknown Error'
        if (error instanceof AxiosError) message = JSON.stringify(error)
        setMessage(message || "Failed to save email. Please try again.");
      } else {
        setMessage("Network error. Please check your connection.");
      }
      console.error("Error saving email:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center justify-center py-6 sm:py-8 md:py-10 md:border md:border-purple-500 rounded-2xl sm:rounded-3xl lg:rounded-full mx-auto max-w-4xl px-4 sm:px-6 my-4 sm:my-6"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >

      <motion.h1
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Join the waitlist
      </motion.h1>


      <motion.p
        className="text-sm sm:text-base md:text-lg lg:text-xl mt-2 sm:mt-4 text-center mx-2 text-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        We are developing the next generation of DeFi wallet
      </motion.p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row mt-6 sm:mt-8 md:mt-10 w-full max-w-md sm:max-w-lg gap-3 sm:gap-0">
        <motion.input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-black rounded-full sm:rounded-l-full sm:rounded-r-none pl-4 py-3 border-0 focus:outline-none w-full sm:w-64 text-sm sm:text-base"
          whileFocus={{ scale: 1.02 }}
          disabled={loading}
        />
        <motion.button
          type="submit"
          className="bg-[#9c2bff] rounded-full sm:rounded-r-full sm:rounded-l-none px-6 py-3 font-bold text-white text-sm sm:text-base whitespace-nowrap hover:bg-purple-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? "Joining..." : "Join"}
        </motion.button>
      </form>

      {message && (
        <motion.p
          className="mt-4 text-white text-sm sm:text-base text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

export default WaitList;