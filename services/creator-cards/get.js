const { throwAppError } = require('@app-core/errors');
const creatorCardRepository = require('@app/repository/creator-card');
const MESSAGES = require('@app/messages/creator-cards');
const { serializeCard } = require('./helpers');

async function getCreatorCard(slug, accessCode) {
  // Rule 1: card does not exist and deleted cards are treated as non-existent
  const card = await creatorCardRepository.findOne({ query: { slug, deleted: null } });
  if (!card) throwAppError(MESSAGES.CARD_NOT_FOUND, 'NF01');

  // Rule 2: card exists but is a draft
  if (card.status === 'draft') throwAppError(MESSAGES.CARD_NOT_FOUND, 'NF02');

  // Rule 3: private card, no access code supplied
  if (card.access_type === 'private' && !accessCode) {
    throwAppError(MESSAGES.CARD_PRIVATE_NO_CODE, 'AC03');
  }

  // Rule 4: private card, wrong access code
  if (card.access_type === 'private' && accessCode !== card.access_code) {
    throwAppError(MESSAGES.CARD_PRIVATE_WRONG_CODE, 'AC04');
  }

  return serializeCard(card, { includeAccessCode: false });
}

module.exports = getCreatorCard;
