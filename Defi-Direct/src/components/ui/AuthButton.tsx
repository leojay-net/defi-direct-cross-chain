"use client";

import React from 'react';
import { UserButton } from '@civic/auth-web3/react';

interface AuthButtonProps {
    className?: string;
    style?: React.CSSProperties;
}

export function AuthButton({ className, style }: AuthButtonProps) {
    return (
        <UserButton
            className={className}
            style={{
                borderRadius: "12px",
                fontSize: "14px",
                padding: "10px 20px",
                backgroundColor: "#7b40e3",
                border: "none",
                boxShadow: "0 4px 14px 0 rgba(123, 64, 227, 0.25)",
                transition: "all 0.3s ease",
                fontWeight: "500",
                color: "#ffffff",
                ...style
            }}
            dropdownButtonStyle={{
                padding: "10px 16px",
                fontSize: "14px",
                backgroundColor: "#1a1a1a",
                borderRadius: "8px",
                border: "1px solid #374151",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
        />
    );
}
