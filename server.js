const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY; // Read API key from environment variable

if (!API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY in environment variables!");
    process.exit(1); // Exit if API key is not found
}

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

app.use(express.json());
app.use(cors({ origin: '*' }));

app.post("/fetch-exercise-plan", async (req, res) => {
    try {
        const { age, gender, bmi, fitnessGoal, fitnessLevel, name } = req.body;

        if (!age || !gender || !bmi || !fitnessGoal || !fitnessLevel) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const prompt = `Create a personalized exercise and diet plan for ${name} (${age} years, ${gender}, BMI: ${bmi}, Goal: ${fitnessGoal}, Level: ${fitnessLevel}).

Use this EXACT format with these EXACT headers:

Weekly Schedule:
Monday: [activity]
Tuesday: [activity]
Wednesday: [activity]
Thursday: [activity]
Friday: [activity]
Saturday: [activity]
Sunday: [activity]

Main Exercises:
[Exercise Name]
Sets: [number]
Reps: [number]
Instructions: [brief instruction]

Diet Plan:
Macronutrient Breakdown:
Protein: [X]g per kg
Carbohydrates: [X]g per kg
Fat: [X]g per kg

Complete Diet Plan:
-Monday
-Tuesday
-Wednesday
-Thursday
-Friday
-Saturday
-Sunday

Pre-Workout Meal:
- [meal item]
- [meal item]

Post-Workout Meal:
- [meal item]
- [meal item]

Keep formatting consistent. Use exact headers as shown. No asterisks or markdown.`;

        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };

        const response = await axios.post(GEMINI_API_URL, requestBody, {
            headers: { "Content-Type": "application/json" }
        });

        const exercisePlan = response.data.candidates[0].content.parts[0].text;
        
        res.json({ exercisePlan });
    } catch (error) {
        console.error("Error details:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "Failed to fetch exercise plan", 
            details: error.response?.data || error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
