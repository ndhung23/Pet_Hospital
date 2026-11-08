const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const geminiClient = require('./gemini.client');

const STANDARD_DISCLAIMER =
  '\n\nDisclaimer: Responses from the AI ​​Assistant are intended for preliminary reference and initial first-aid support only. If your pet shows signs of a critical condition, please take them immediately to a PHMS Veterinary Hospital or contact the emergency hotline so that a veterinarian can provide timely professional care.';

const CRITICAL_KEYWORDS = [
  'chảy máu',
  'máu',
  'co giật',
  'giật',
  'khó thở',
  'không thở',
  'ngạt',
  'bất tỉnh',
  'hôn mê',
  'ngộ độc',
  'thuốc chuột',
  'liệt',
  'sốc',
  'gãy xương',
  'bleeding',
  'blood',
  'seizure',
  'convulsion',
  'unconscious',
  'poison',
  'toxic',
  'paralyzed',
  'not breathing',
  'shock',
];

/**
 * UC-AI-01: Get user's AI Chat History
 */
const getChatHistory = async (userId, limit = 50) => {
  return prisma.aIChatLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: limit,
    include: {
      pet: {
        select: {
          id: true,
          name: true,
          species: true,
        },
      },
    },
  });
};

/**
 * UC-AI-01: Consult Gemini AI Advisor
 */
const consultAi = async ({ userId, message, petId }) => {
  // Rate Limit: 10 questions per hour per user
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const questionsInLastHour = await prisma.aIChatLog.count({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (questionsInLastHour >= 10) {
    throw new AppError(
      'You have exceeded the limit of 10 questions per hour for the AI ​​assistant. Please try again later or contact our hotline for direct assistance.',
      429
    );
  }

  // Detect critical symptoms for triage guidance
  const lowerMsg = message.toLowerCase();
  const isCritical = CRITICAL_KEYWORDS.some((kw) => lowerMsg.includes(kw));

  // Build Personalized Context from DB (Pet profiles, past MedicalRecord diagnoses)
  let petContextText = '';
  let selectedPet = null;

  if (petId) {
    selectedPet = await prisma.pet.findFirst({
      where: { id: petId, ownerId: userId },
      include: {
        medicalRecords: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });
  }

  if (selectedPet) {
    petContextText = `Patient Pet: ${selectedPet.name} (${selectedPet.species}${
      selectedPet.breed ? `, ${selectedPet.breed}` : ''
    }, Weight: ${selectedPet.weight || 'unknown'}kg).`;
    if (selectedPet.history) {
      petContextText += ` General Medical History: ${selectedPet.history}.`;
    }
    if (selectedPet.medicalRecords && selectedPet.medicalRecords.length > 0) {
      const pastRecords = selectedPet.medicalRecords
        .map((r) => `[${r.createdAt.toISOString().split('T')[0]}] Diagnosis: ${r.diagnosis}, Treatment: ${r.treatmentPlan}`)
        .join('; ');
      petContextText += ` Recent Clinical Records: ${pastRecords}.`;
    }
  } else {
    // Check if owner has any registered pets to provide general context
    const ownerPets = await prisma.pet.findMany({
      where: { ownerId: userId },
      select: { name: true, species: true, breed: true },
      take: 5,
    });
    if (ownerPets.length > 0) {
      const petList = ownerPets.map((p) => `${p.name} (${p.species})`).join(', ');
      petContextText = `Pet Owner registered pets: ${petList}.`;
    }
  }

  const systemInstruction = `You are the PHMS Veterinary AI Health Advisor for PHMS Veterinary Hospital.
Provide compassionate, accurate, structured pet first-aid and symptom advice.
If symptoms are critical, emphasize emergency action immediately.
Keep recommendations practical and professional.`;

  let prompt = '';
  if (petContextText) {
    prompt += `CONTEXT FROM HOSPITAL DATABASE:\n${petContextText}\n\n`;
  }
  prompt += `PET OWNER QUESTION:\n${message}\n\nPlease provide guidance.`;

  // Call Gemini Client with 8s SLA
  const aiResult = await geminiClient.generateGeminiContent({
    prompt,
    systemInstruction,
  });

  let fullResponse = aiResult.text;

  // If critical, append quick booking / emergency recommendation link
  if (isCritical) {
    fullResponse +=
      '\n\n🚨 URGENT: The symptoms mentioned may indicate a critical emergency condition. Please bring your pet to the clinic immediately or book an emergency visit.';
  }

  // Mandatory disclaimer appended to every answer
  fullResponse += STANDARD_DISCLAIMER;

  // Persist in AIChatLog
  const chatLog = await prisma.aIChatLog.create({
    data: {
      userId,
      petId: selectedPet ? selectedPet.id : null,
      questionRaw: message,
      aiResponse: fullResponse,
    },
    include: {
      pet: {
        select: {
          id: true,
          name: true,
          species: true,
        },
      },
    },
  });

  return {
    chatLog,
    isCritical,
    isFallback: aiResult.isFallback,
  };
};

/**
 * Public quick triage consultation for visitors / unauthenticated sessions
 */
const consultAiGuest = async ({ message, petType = 'Pet' }) => {
  const lowerMsg = message.toLowerCase();
  const isCritical = CRITICAL_KEYWORDS.some((kw) => lowerMsg.includes(kw));

  const systemInstruction = `You are the PHMS Veterinary AI Health Advisor for PHMS Veterinary Hospital.
Provide compassionate, accurate, structured pet first-aid and symptom advice.
If symptoms are critical, emphasize emergency action immediately.
Keep recommendations practical and professional.`;

  const prompt = `PATIENT TYPE: ${petType}\nQUESTION:\n${message}\n\nPlease provide guidance.`;

  const aiResult = await geminiClient.generateGeminiContent({
    prompt,
    systemInstruction,
  });

  let fullResponse = aiResult.text;
  if (isCritical) {
    fullResponse +=
      '\n\n🚨 URGENT: The symptoms mentioned may indicate a critical emergency condition. Please bring your pet to the clinic immediately or contact our 24/7 hotline 0359 928 446.';
  }
  fullResponse += STANDARD_DISCLAIMER;

  return {
    chatLog: {
      id: 'guest-' + Date.now(),
      questionRaw: message,
      aiResponse: fullResponse,
      createdAt: new Date().toISOString(),
    },
    isCritical,
    isFallback: aiResult.isFallback,
  };
};

module.exports = {
  getChatHistory,
  consultAi,
  consultAiGuest,
};
