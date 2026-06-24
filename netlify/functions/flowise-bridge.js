exports.handler = async function(event, context) {
  // Reject anything that isn't a POST request
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const payload = JSON.parse(event.body);
  
  // These variables are stored securely in your Netlify dashboard
  const FLOWISE_URL = process.env.FLOWISE_URL; 
  const FLOWISE_API_KEY = process.env.FLOWISE_API_KEY;

  try {
    // Send the raw text context to Flowise as the 'question' parameter
    const response = await fetch(FLOWISE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLOWISE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: payload.textContext
      })
    });

    if (!response.ok) {
      throw new Error(`Flowise returned status ${response.status}`);
    }

    const data = await response.json();
    
    // Flowise returns the LLM output in the 'text' property.
    // We clean it just in case the LLM wrapped it in markdown code blocks.
    let cleanJsonString = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Parse it to ensure it is valid JSON before sending to the frontend
    const aiOutput = JSON.parse(cleanJsonString);

    return {
      statusCode: 200,
      body: JSON.stringify(aiOutput)
    };
  } catch (error) {
    console.error("Flowise Bridge Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "AI processing failed" }) };
  }
};
