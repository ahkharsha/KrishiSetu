const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xA79974A617cFD0658bCedD0821A46255d5Df57c9";
  const KrishiSetu = await ethers.getContractFactory("KrishiSetu");
  const KrishiSetu = await KrishiSetu.attach(contractAddress);

  const lessonData = {
    title: "Advanced Rice Cultivation",
    content: "Master water-efficient rice farming techniques for higher yields...",
    questions: {
      q1: "What is the most water-efficient rice cultivation method?",
      q1Options: ["System of Rice Intensification (SRI)", "Flood irrigation", "Rainfed cultivation"],
      q2: "Which nutrient is most critical for rice growth?",
      q2Options: ["Nitrogen", "Phosphorus", "Potassium"],
      q3: "What is the ideal pH range for rice paddies?",
      q3Options: ["6.0-6.5", "4.0-5.0", "7.0-8.0"]
    },
    points: 120
  };

  console.log("Adding rice farming lesson...");
  const tx = await KrishiSetu.addLesson(
    lessonData.title,
    lessonData.content,
    lessonData.questions.q1,
    lessonData.questions.q1Options[0],
    lessonData.questions.q1Options[1],
    lessonData.questions.q1Options[2],
    lessonData.questions.q2,
    lessonData.questions.q2Options[0],
    lessonData.questions.q2Options[1],
    lessonData.questions.q2Options[2],
    lessonData.questions.q3,
    lessonData.questions.q3Options[0],
    lessonData.questions.q3Options[1],
    lessonData.questions.q3Options[2],
    lessonData.points
  );

  await tx.wait();
  console.log("Rice farming lesson added successfully!");
}

main().catch(console.error);