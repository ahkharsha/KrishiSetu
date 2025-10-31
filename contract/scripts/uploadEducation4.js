const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xA79974A617cFD0658bCedD0821A46255d5Df57c9";
  const KrishiSetu = await ethers.getContractFactory("KrishiSetu");
  const KrishiSetu = await KrishiSetu.attach(contractAddress);

  const lessonData = {
    title: "Specialty Coffee Production",
    content: "Techniques for growing high-quality Arabica coffee beans...",
    questions: {
      q1: "What is the optimal altitude for Arabica coffee?",
      q1Options: ["1,000-2,000 meters", "Sea level-500 meters", "Above 2,500 meters"],
      q2: "Which processing method produces 'natural' coffee?",
      q2Options: ["Dry processing", "Wet processing", "Honey processing"],
      q3: "What is the main pest affecting coffee plants?",
      q3Options: ["Coffee berry borer", "Aphids", "Whiteflies"]
    },
    points: 180
  };

  console.log("Adding coffee production lesson...");
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
  console.log("Coffee production lesson added successfully!");
}

main().catch(console.error);