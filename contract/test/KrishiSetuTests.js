const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("KrishiSetu", function () {
  // Define enums to match contract
  const CropType = {
    MAIZE: 0,
    RICE: 1,
    WHEAT: 2,
    CASSAVA: 3,
    BEANS: 4,
    SORGHUM: 5,
    MILLET: 6,
    YAM: 7,
    POTATOES: 8,
    COFFEE: 9,
    COTTON: 10
  };

  const CropStage = {
    SOWN: 0,
    GROWING: 1,
    HARVESTED: 2,
    STORED: 3,
    SELLING: 4,
    SOLD: 5
  };

  const ProposalType = {
    AdminChange: 0,
    FundAllocation: 1,
    GeneralProposal: 2
  };

  describe("1. Deployment & Initial Setup", function () {
    let KrishiSetu;
    let KrishiSetu;
    let owner;

    before(async function () {
      [owner] = await ethers.getSigners();
      KrishiSetu = await ethers.getContractFactory("KrishiSetu");
      KrishiSetu = await KrishiSetu.deploy();
    });

    it("should deploy with the correct owner", async function () {
      expect(await KrishiSetu.owner()).to.equal(owner.address);
    });

    it("should initialize crop sustainability scores", async function () {
      expect(await KrishiSetu.cropSustainabilityScores(CropType.MAIZE)).to.equal(4);
      expect(await KrishiSetu.cropSustainabilityScores(CropType.CASSAVA)).to.equal(7);
    });

    it("should initialize harvest points", async function () {
      expect(await KrishiSetu.cropHarvestPoints(CropType.MAIZE)).to.equal(1);
      expect(await KrishiSetu.cropHarvestPoints(CropType.COFFEE)).to.equal(4);
    });

    it("should return correct crop types", async function () {
      const cropTypes = await KrishiSetu.getCropTypes();
      expect(cropTypes).to.deep.equal([
        "MAIZE", "RICE", "WHEAT", "CASSAVA", "BEANS",
        "SORGHUM", "MILLET", "YAM", "POTATOES", "COFFEE", "COTTON"
      ]);
    });

    it("should return correct proposal types", async function () {
      const proposalTypes = await KrishiSetu.getProposalTypes();
      expect(proposalTypes).to.deep.equal(["ADMIN_CHANGE", "FUND_ALLOCATION", "GENERAL_PROPOSAL"]);
    });
  });

  describe("2. Farmer Management", function () {
    let KrishiSetu;
    let KrishiSetu;
    let owner, farmer1, farmer2, nonFarmer;

    before(async function () {
      [owner, farmer1, farmer2, nonFarmer] = await ethers.getSigners();
      KrishiSetu = await ethers.getContractFactory("KrishiSetu");
      KrishiSetu = await KrishiSetu.deploy();
    });

    it("should allow farmers to register", async function () {
      await expect(KrishiSetu.connect(farmer1).registerFarmer())
        .to.emit(KrishiSetu, "FarmerRegistered")
        .withArgs(farmer1.address, 200);
      
      const farmer = await KrishiSetu.getFarmerProfile(farmer1.address);
      expect(farmer.isRegistered).to.be.true;
    });

    it("should prevent duplicate registration with custom error", async function () {
      await expect(
        KrishiSetu.connect(farmer1).registerFarmer()
      ).to.be.revertedWithCustomError(KrishiSetu, "KrishiSetu__AlreadyRegistered");
    });

    it("should return registered farmers", async function () {
      await KrishiSetu.connect(farmer2).registerFarmer();
      
      const farmers = await KrishiSetu.getRegisteredFarmers();
      expect(farmers).to.include(farmer2.address);
    });

    it("should prevent non-registered farmers from farmer-only functions", async function () {
      await expect(
        KrishiSetu.connect(nonFarmer).sowCrop(CropType.MAIZE, "farm123", 100)
      ).to.be.revertedWithCustomError(KrishiSetu, "KrishiSetu__FarmerNotRegistered");
    });

    it("should return farmer profiles", async function () {
      const profile = await KrishiSetu.getFarmerProfile(farmer1.address);
      expect(profile.walletAddress).to.equal(farmer1.address);
    });

    it("should return farmer history", async function () {
      const history = await KrishiSetu.getFarmerHistory(farmer1.address);
      expect(history.length).to.be.gt(0);
    });

    it("should return top farmers by sustainability", async function () {
      await KrishiSetu.connect(farmer1).sowCrop(CropType.CASSAVA, "farm1", 100);
      await KrishiSetu.connect(farmer1).updateCropStage(1, CropStage.GROWING, 0);
      
      const [topFarmers, scores] = await KrishiSetu.getTopFarmersBySustainability(2);
      expect(topFarmers.length).to.equal(2);
    });
  });

  describe("3. Treasury Functions", function () {
    let KrishiSetu;
    let KrishiSetu;
    let owner, testFarmer;

    beforeEach(async function () {
      [owner, testFarmer] = await ethers.getSigners();
      KrishiSetu = await ethers.getContractFactory("KrishiSetu");
      KrishiSetu = await KrishiSetu.deploy();
      await KrishiSetu.connect(testFarmer).registerFarmer();
    });

    it("should accept donations to treasury", async function () {
      const donationAmount = ethers.parseEther("1.0");
      await expect(
        KrishiSetu.connect(testFarmer).donateToTreasury({ value: donationAmount })
      )
        .to.emit(KrishiSetu, "TreasuryDonation")
        .withArgs(testFarmer.address, donationAmount, anyValue);
    });

    it("should prevent zero donations", async function () {
      await expect(
        KrishiSetu.connect(testFarmer).donateToTreasury({ value: 0 })
      ).to.be.revertedWithCustomError(KrishiSetu, "KrishiSetu__InvalidDonationAmount");
    });

    it("should allow owner to withdraw funds", async function () {
      const donationAmount = ethers.parseEther("1.0");
      await KrishiSetu.connect(testFarmer).donateToTreasury({ value: donationAmount });
      
      const withdrawAmount = ethers.parseEther("0.5");
      await expect(
        KrishiSetu.connect(owner).withdrawDAOFunds(owner.address, withdrawAmount)
      ).to.emit(KrishiSetu, "TreasuryWithdrawn");
    });
  });

  describe("4. Crop Lifecycle Management", function () {
    let KrishiSetu;
    let KrishiSetu;
    let testFarmer;
    let cropId;

    beforeEach(async function () {
      [testFarmer] = await ethers.getSigners();
      KrishiSetu = await ethers.getContractFactory("KrishiSetu");
      KrishiSetu = await KrishiSetu.deploy();
      await KrishiSetu.connect(testFarmer).registerFarmer();
      await KrishiSetu.connect(testFarmer).sowCrop(CropType.MAIZE, "farm123", 100);
      cropId = 1;
    });

    it("should allow sowing crops", async function () {
      const crop = await KrishiSetu.crops(cropId);
      expect(crop.farmerAddress).to.equal(testFarmer.address);
    });

    it("should update crop stage from SOWN to GROWING", async function () {
      await expect(
        KrishiSetu.connect(testFarmer).updateCropStage(cropId, CropStage.GROWING, 0)
      ).to.emit(KrishiSetu, "CropStageUpdated");
    });

    it("should allow storing harvested crops", async function () {
      await KrishiSetu.connect(testFarmer).updateCropStage(cropId, CropStage.GROWING, 0);
      await KrishiSetu.connect(testFarmer).updateCropStage(cropId, CropStage.HARVESTED, 10);
      
      await expect(
        KrishiSetu.connect(testFarmer).storeCrop(cropId)
      ).to.emit(KrishiSetu, "CropStored");
    });
  });

  describe("5. Marketplace Functions", function () {
    let KrishiSetu;
    let KrishiSetu;
    let seller, buyer;
    let cropId, listingId;

    beforeEach(async function () {
      [seller, buyer] = await ethers.getSigners();
      KrishiSetu = await ethers.getContractFactory("KrishiSetu");
      KrishiSetu = await KrishiSetu.deploy();
      await KrishiSetu.connect(seller).registerFarmer();
      await KrishiSetu.connect(buyer).registerFarmer();
      
      await KrishiSetu.connect(seller).sowCrop(CropType.MAIZE, "farm123", 100);
      cropId = 1;
      await KrishiSetu.connect(seller).updateCropStage(cropId, CropStage.GROWING, 0);
      await KrishiSetu.connect(seller).updateCropStage(cropId, CropStage.HARVESTED, 10);
      await KrishiSetu.connect(seller).storeCrop(cropId);
      
      await KrishiSetu.connect(seller).listCropForSale(cropId, ethers.parseEther("0.1"), 50);
      listingId = 1;
    });

    it("should allow listing crops for sale", async function () {
      const listing = await KrishiSetu.marketListings(listingId);
      expect(listing.isActive).to.be.true;
    });

    it("should allow purchasing listed crops", async function () {
      await expect(
        KrishiSetu.connect(buyer).purchaseCrop(listingId, { value: ethers.parseEther("0.1") })
      ).to.emit(KrishiSetu, "CropPurchased");
    });
  });

  describe("6. Governance Functions", function () {
    let KrishiSetu;
    let KrishiSetu;
    let testFarmer1, testFarmer2;
    let proposalId;

    beforeEach(async function () {
      [testFarmer1, testFarmer2] = await ethers.getSigners();
      KrishiSetu = await ethers.getContractFactory("KrishiSetu");
      KrishiSetu = await KrishiSetu.deploy();
      await KrishiSetu.connect(testFarmer1).registerFarmer();
      await KrishiSetu.connect(testFarmer2).registerFarmer();
      
      await KrishiSetu.connect(testFarmer1).createProposal(
        "Test Proposal",
        ProposalType.AdminChange,
        "Test description",
        testFarmer2.address,
        0,
        { value: ethers.parseEther("0.01") }
      );
      proposalId = 1;
    });

    it("should allow creating a proposal with stake", async function () {
      const proposal = await KrishiSetu.proposals(proposalId);
      expect(proposal.proposer).to.equal(testFarmer1.address);
    });

    it("should allow voting on proposals", async function () {
      await expect(
        KrishiSetu.connect(testFarmer2).voteOnProposal(proposalId, true)
      ).to.emit(KrishiSetu, "VoteCast");
    });
  });

  describe("7. Education Functions", function () {
    let KrishiSetu;
    let KrishiSetu;
    let owner, testFarmer;
    let lessonId;

    beforeEach(async function () {
      [owner, testFarmer] = await ethers.getSigners();
      KrishiSetu = await ethers.getContractFactory("KrishiSetu");
      KrishiSetu = await KrishiSetu.deploy();
      await KrishiSetu.connect(testFarmer).registerFarmer();
      
      await KrishiSetu.connect(owner).addLesson(
        "Test Lesson",
        "Content",
        "Q1", "A", "B", "C",
        "Q2", "A", "B", "C",
        "Q3", "A", "B", "C",
        10
      );
      lessonId = 1;
    });

    it("should allow owner to add lessons", async function () {
      const lesson = await KrishiSetu.getLesson(lessonId);
      expect(lesson.title).to.equal("Test Lesson");
    });

    it("should allow farmers to complete lessons", async function () {
      await expect(
        KrishiSetu.connect(testFarmer).completeLesson(lessonId)
      ).to.emit(KrishiSetu, "LessonCompleted");
    });
  });

  describe("8. Additional View Functions", function () {
    let KrishiSetu;
    let KrishiSetu;
    let testFarmer1, testFarmer2;

    beforeEach(async function () {
      [testFarmer1, testFarmer2] = await ethers.getSigners();
      KrishiSetu = await ethers.getContractFactory("KrishiSetu");
      KrishiSetu = await KrishiSetu.deploy();
      await KrishiSetu.connect(testFarmer1).registerFarmer();
      await KrishiSetu.connect(testFarmer2).registerFarmer();
    });

    it("should return all farmers", async function () {
      const farmers = await KrishiSetu.getAllFarmers();
      expect(farmers).to.include(testFarmer1.address);
    });

    it("should return sustainability scores", async function () {
      const [farmers, scores] = await KrishiSetu.getSustainabilityScores();
      expect(farmers.length).to.equal(2);
    });
  });

  // Helper for anyValue assertion
  function anyValue() {
    return true;
  }
});