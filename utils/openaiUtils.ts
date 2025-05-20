import { Platform } from 'react-native';
import { OPENAI_API_KEY } from '@env';

// Function to estimate calories and protein from a food description
export const estimateNutrition = async (foodDescription: string): Promise<{ calories: number, protein: number, isFoodItem: boolean } | null> => {
  try {
    // Get API key from environment variables
    const apiKey = OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key not found');
      return null;
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. Provide estimated calories and protein content for food descriptions. Respond ONLY with a JSON object containing calories (in kcal), protein (in grams), and isFoodItem (boolean) as properties. Make reasonable estimates based on typical portions. If the input is not a food or drink item, set calories and protein to 0 and isFoodItem to false. For food items, set isFoodItem to true. For coffee drinks, assume the coffee was ordered from a artisanal coffee shop, not a starbucks (cortado 30ml milk, cappuccino 12 ml milk, lattes are 12 oz, iced lattest have less, etc."
          },
          {
            role: "user",
            content: `Estimate calories and protein for: ${foodDescription}`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const resultJson = JSON.parse(data.choices[0].message.content);
    
    // Validate response format
    if (typeof resultJson.calories === 'number' && 
        typeof resultJson.protein === 'number' && 
        typeof resultJson.isFoodItem === 'boolean') {
      return {
        calories: Math.round(resultJson.calories),
        protein: Math.round(resultJson.protein),
        isFoodItem: resultJson.isFoodItem
      };
    } else {
      throw new Error('Invalid response format from API');
    }
  } catch (error) {
    console.error('Error estimating nutrition:', error);
    return null;
  }
}; 