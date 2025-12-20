import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyConnection() {
  try {
    const { client } = await import("../sanity/lib/client");
    console.log("Verifying Sanity connection...");
    console.log("Project ID:", client.config().projectId);
    console.log("Dataset:", client.config().dataset);
    
    const result = await client.fetch('*[_type == "product"][0...1]');
    console.log("Connection successful!");
    console.log("Products found:", result.length);
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

verifyConnection();
