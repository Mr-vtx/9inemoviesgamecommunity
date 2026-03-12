function generateCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return `9INE-${code}`;
}

function generateCodes(count = 25) {
  const codes = new Set();

  while (codes.size < count) {
    codes.add(generateCode());
  }

  return Array.from(codes);
}

const codes = generateCodes(25);

console.log("\n🎉 Generated Community Codes:\n");
console.log(`COMMUNITY_CODES=${codes.join(",")}\n`);
