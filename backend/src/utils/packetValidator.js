//packet util
export const validateSOSPacket = (packet) => {
  const requiredFields = ["messageId", "userId", "timestamp", "emergencyType"];

  for (const field of requiredFields) {
    if (!packet[field]) {
      return { valid: false, missing: field };
    }
  }

  return { valid: true };
};
