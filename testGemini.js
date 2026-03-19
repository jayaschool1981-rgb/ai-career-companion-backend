const testModels = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-pro"
];

for (const m of testModels) {
  try {
    const model = genAI.getGenerativeModel({ model: m });
    const res = await model.generateContent("Hello");
    console.log(`✅ WORKS: ${m}`);
  } catch (e) {
    console.log(`❌ FAIL: ${m}`);
  }
}