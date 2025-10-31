const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xA79974A617cFD0658bCedD0821A46255d5Df57c9";
  const KrishiSetu = await ethers.getContractFactory("KrishiSetu");
  const KrishiSetu = await KrishiSetu.attach(contractAddress);

  const lessonData = {
    title: "Soil Health Management",
    content: "Learn regenerative practices to improve soil fertility and structure...",
    questions: {
      q1: "Which practice is NOT recommended for soil conservation?",
      q1Options: ["Monocropping", "Cover cropping", "Crop rotation"],
      q2: "What is the ideal organic matter percentage in healthy soil?",
      q2Options: ["3-5%", "0-1%", "10-15%"],
      q3: "Which microorganism is most beneficial for soil?",
      q3Options: ["Mycorrhizal fungi", "E. coli", "Salmonella"]
    },
    points: 150
  };

  console.log("Adding soil health lesson...");
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
  console.log("Soil health lesson added successfully!");
}

main().catch(console.error);