"use client"

import React, { useEffect, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  // State to track if MetaKeep iframe is present
  const [hasMetaKeepIframe, setHasMetaKeepIframe] = useState(false)

  useEffect(() => {
    // Check for MetaKeep iframe
    const checkForMetaKeepIframe = () => {
      const iframe = document.querySelector('iframe#metakeep-iframe, iframe[src*="metakeep"], div[class*="frame-wrapper"]')
      const isPresent = !!iframe
      console.log('MetaKeep iframe or wrapper detected:', isPresent, iframe)
      if (iframe) {
        // Ensure the iframe or wrapper has a high z-index
        if (iframe instanceof HTMLElement) {
          iframe.style.zIndex = '9999'
          // Also ensure pointer-events are enabled
          iframe.style.pointerEvents = 'auto'
          // Try to find and adjust the parent wrapper if it exists
          const wrapper = iframe.closest('div[class*="frame-wrapper"]')
          if (wrapper && wrapper instanceof HTMLElement) {
            wrapper.style.zIndex = '9999'
            wrapper.style.pointerEvents = 'auto'
          }
        }
      }
      setHasMetaKeepIframe(isPresent)
    }

    checkForMetaKeepIframe()
    // Recheck when DOM changes to catch dynamic iframe insertion
    const observer = new MutationObserver(checkForMetaKeepIframe)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        // Lower z-index when MetaKeep iframe is present to ensure iframe is clickable
        hasMetaKeepIframe ? "z-[0]" : "z-50",
        className
      )}
      style={{
        // Additional style to ensure pointer events are disabled
        pointerEvents: hasMetaKeepIframe ? 'none' : 'auto'
      }}
      {...props}
    />
  )
})
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // State to track if MetaKeep iframe is present
  const [hasMetaKeepIframe, setHasMetaKeepIframe] = useState(false)

  useEffect(() => {
    const checkForMetaKeepIframe = () => {
      const iframe = document.querySelector('iframe#metakeep-iframe, iframe[src*="metakeep"], iframe[src*="auth.metakeep.xyz"], div[class*="frame-wrapper"], div[class*="close-frame"]')
      const isPresent = !!iframe
      console.log('MetaKeep iframe detected in content:', isPresent, iframe)
      setHasMetaKeepIframe(isPresent)
    }

    checkForMetaKeepIframe()
    const observer = new MutationObserver(checkForMetaKeepIframe)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          hasMetaKeepIframe ? "pointer-events-none z-[0]" : "z-50",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
