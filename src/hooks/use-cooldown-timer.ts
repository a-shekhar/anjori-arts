import { useState, useEffect, useCallback } from "react";

/**
 * Reusable countdown cooldown timer for OTP and verification resend buttons.
 * Prevents timer leaks and standardizes cooldown state across authentication views.
 */
export function useCooldownTimer(initialSeconds: number = 0) {
  const [countdown, setCountdown] = useState(initialSeconds);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const start = useCallback((seconds: number) => {
    setCountdown(seconds);
  }, []);

  const reset = useCallback(() => {
    setCountdown(0);
  }, []);

  return {
    countdown,
    isCooldownActive: countdown > 0,
    start,
    reset,
  };
}

