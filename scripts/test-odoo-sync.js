const { pushBookingToOdoo } = require("./lib/odoo/grooming-sync");
require("dotenv").config({ path: ".env" });

async function run() {
    const result = await pushBookingToOdoo({
        petType: "dog",
        petName: "Test Sync Script " + Math.floor(Math.random() * 1000),
        breedSize: "small", // standard name
        package: "standard",
        price: 35000,
        appointmentDate: new Date().toISOString(),
        appointmentTime: "10:00",
        customerName: "Test Auto Sync",
        customerEmail: "test@auto.sync",
        customerPhone: "+255755123456",
        specialNotes: "Test Notes",
        detangling: false,
        bookingNumber: "GRM-TEST-123",
    });

    console.log("Sync Result:", result);
}

// We need to use tsc or tsx, or just write a pure JS equivalent since we can't `require` TS easily.
// Let me refactor to pure XMLRPC.
