
const Gemini_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"


export async function generateContent(prompt) {
    try {
        console.log("gimini api key::", process.env.GEMINI_API_KEY)
        const response = await fetch(`${Gemini_Url}?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }]
                    } 
                ]
            })
        });

        console.log("response:: ", response)

        if (!response.ok) {
            const err = await response.text();
            console.log("err:: ", err)
            throw new Error(`Gemini API error: ${err}`);
        }

        const data = await response.json();
        // Extract the main content; structure may vary by Gemini version, adjust as needed
        const mainContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!mainContent) {
            throw new Error("No text returned from the Gemini");
        }

        const cleanText = mainContent
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        console.log("clean text", cleanText)
        return cleanText;
    } catch (error) {
        throw new Error(`Failed to fetch from Gemini API: ${error.message}`);
    }
}


