import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function getModels() {
  console.log("Checking available models...");
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("\n✅ SUCCESS! Here are your available models:\n");
      data.models.forEach(m => {
        // We only care about models that support 'generateContent'
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`- Name: ${m.name.replace("models/", "")}`);
        }
      });
    } else {
      console.log("❌ Error:", data);
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

getModels();