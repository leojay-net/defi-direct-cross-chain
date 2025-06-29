"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                duration: 0.3,
                ease: "easeInOut"
            }}
        >
            {children}
        </motion.div>
    );
}

export function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.6,
                delay,
                ease: "easeOut"
            }}
        >
            {children}
        </motion.div>
    );
}

export function SlideIn({ children, direction = 'left', delay = 0 }: {
    children: React.ReactNode;
    direction?: 'left' | 'right' | 'up' | 'down';
    delay?: number;
}) {
    const variants = {
        left: { x: -50, opacity: 0 },
        right: { x: 50, opacity: 0 },
        up: { y: -50, opacity: 0 },
        down: { y: 50, opacity: 0 }
    };

    return (
        <motion.div
            initial={variants[direction]}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{
                duration: 0.5,
                delay,
                ease: "easeOut"
            }}
        >
            {children}
        </motion.div>
    );
}
