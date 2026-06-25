"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getLatestGroomingStatus } from "@/lib/actions/grooming";
import { Bell, CheckCircle2, Scissors, CalendarCheck } from "lucide-react";

/**
 * Polling component to notify user of grooming status changes
 */
export function GroomingStatusNotification() {
    const { data: session, status } = useSession();
    const [lastStatus, setLastStatus] = useState<string | null>(null);
    const [lastBookingId, setLastBookingId] = useState<number | null>(null);
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    // Load last notified status from sessionStorage to avoid repeats on page refresh
    useEffect(() => {
        const stored = sessionStorage.getItem("last_notified_status");
        if (stored) {
            try {
                const { status: s, id } = JSON.parse(stored);
                setLastStatus(s);
                setLastBookingId(id);
            } catch (e) {
                // Ignore parsing errors
            }
        }
    }, []);

    useEffect(() => {
        if (status !== "authenticated" || !session?.user) return;

        const checkStatus = async () => {
            try {
                const result = await getLatestGroomingStatus();
                if (result.success && result.booking) {
                    const { id, state, pet_name } = result.booking;
                    
                    // Only notify if status changed for the SAME booking, or if it's a NEW booking
                    if (id !== lastBookingId || state !== lastStatus) {
                        
                        // Define messages mapping
                        const messages: Record<string, string> = {
                            "checked_in": `Your pet has safely checked in at Stephan's Pet Store and grooming will begin shortly. We’ll update you once the session is halfway done.`,
                            "halfway": `Your pet’s grooming at Stephan's Pet Store is about halfway complete. We’ll notify you once they’re ready for pickup.`,
                            "completed": `Your pet is ready for pickup at Stephan's Pet Store. Please plan to pick them up within the next hour, as a late pickup fee may apply after that time.`,
                        };

                        const icons: Record<string, any> = {
                            "checked_in": <CalendarCheck className="h-5 w-5 text-blue-500" />,
                            "halfway": <Scissors className="h-5 w-5 text-orange-500" />,
                            "completed": <CheckCircle2 className="h-5 w-5 text-green-500" />,
                        };

                        const titles: Record<string, string> = {
                            "checked_in": "Check-in Confirmed",
                            "halfway": "Grooming in Progress",
                            "completed": "Ready for Pickup",
                        };

                        if (messages[state]) {
                            toast(titles[state], {
                                description: messages[state],
                                icon: icons[state] || <Bell className="h-5 w-5" />,
                                duration: 10000,
                            });
                        }

                        // Update state and persistence
                        setLastStatus(state);
                        setLastBookingId(id);
                        sessionStorage.setItem("last_notified_status", JSON.stringify({ status: state, id }));
                    }
                }
            } catch (err) {
                console.warn("Status polling error:", err);
            }
        };

        // Run immediately
        checkStatus();

        // Start polling every 30 seconds
        pollingInterval.current = setInterval(checkStatus, 30000);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [status, session, lastStatus, lastBookingId]);

    return null; // This component doesn't render anything visible
}
