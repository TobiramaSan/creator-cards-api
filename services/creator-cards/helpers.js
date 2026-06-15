function generateSlugBase(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

function generateSuffix() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// includeAccessCode=true for create/delete responses; false for GET
function serializeCard(doc, { includeAccessCode = false } = {}) {
  const card = { ...doc };
  card.id = card._id;
  delete card._id;
  if (card.__v !== undefined) delete card.__v;
  if (!includeAccessCode) delete card.access_code;
  return card;
}

module.exports = { generateSlugBase, generateSuffix, serializeCard };
