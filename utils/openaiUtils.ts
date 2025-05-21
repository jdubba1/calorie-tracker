import { Platform } from "react-native";
import { OPENAI_API_KEY } from "@env";

// Function to estimate calories and protein from a food description
export const estimateNutrition = async (
  foodDescription: string,
): Promise<{
  calories: number;
  protein: number;
  containsFoodItem: boolean;
  label: string;
} | null> => {
  try {
    // Get API key from environment variables
    const apiKey = OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OpenAI API key not found");
      return null;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition expert. Extract any food or drink items from user descriptions and estimate nutrition values. Respond ONLY with a JSON object containing: 1) calories (in kcal), 2) protein (in grams), 3) containsFoodItem (boolean), and 4) label (a clean, concise summary of just the food items mentioned, contains some size details). If ANY food or drink is mentioned, set containsFoodItem to true and provide estimates. If NO food items are found, set calories and protein to 0, containsFoodItem to false, and label to an empty string. For coffee drinks, assume typical artisanal coffee shop sizes. Example: 'I was walking and had a burger for lunch then went home' → containsFoodItem: true, label: 'burger'. 'Just drinking some water while working' → containsFoodItem: true, label: 'water'. 'No food here, just talking about my day' → containsFoodItem: false.",
          },
          {
            role: "user",
            content: `Extract food items and estimate nutrition for: ${foodDescription}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const resultJson = JSON.parse(data.choices[0].message.content);

    // Validate response format
    if (
      typeof resultJson.calories === "number" &&
      typeof resultJson.protein === "number" &&
      typeof resultJson.containsFoodItem === "boolean" &&
      typeof resultJson.label === "string"
    ) {
      return {
        calories: Math.round(resultJson.calories),
        protein: Math.round(resultJson.protein),
        containsFoodItem: resultJson.containsFoodItem,
        label: resultJson.label,
      };
    } else {
      throw new Error("Invalid response format from API");
    }
  } catch (error) {
    console.error("Error estimating nutrition:", error);
    return null;
  }
};
