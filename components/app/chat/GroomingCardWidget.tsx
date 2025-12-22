import { Calendar, Check, Clock, Scissors } from "lucide-react";

interface GroomingBookingResult {
    bookingNumber: string;
    petName: string;
    package: string;
    appointmentDate: string;
    appointmentTime: string;
    priceFormatted: string;
    detangling: boolean;
}

interface GroomingCardWidgetProps {
    booking: GroomingBookingResult;
}

export function GroomingCardWidget({ booking }: GroomingCardWidgetProps) {
    return (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <Scissors className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                            Grooming Confirmed
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            #{booking.bookingNumber}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md p-3 space-y-2 mb-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">Pet</span>
                    <span className="font-medium">{booking.petName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">Service</span>
                    <span className="font-medium">{booking.package}</span>
                </div>
                {booking.detangling && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Add-on</span>
                        <span className="font-medium text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full dark:bg-orange-900/40 dark:text-orange-300">Detangling</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <span>{booking.appointmentDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <span>{booking.appointmentTime}</span>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Total Price
                </span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {booking.priceFormatted}
                </span>
            </div>
        </div>
    );
}
