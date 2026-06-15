const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const creatorCardRepository = require('@app/repository/creator-card');
const MESSAGES = require('@app/messages/creator-cards');
const { serializeCard } = require('./helpers');

const deleteSpec = `root {
  creator_reference string<length:20>
}`;

const parsedDeleteSpec = validator.parse(deleteSpec);

async function deleteCreatorCard(slug, data) {
  validator.validate(data, parsedDeleteSpec);

  const card = await creatorCardRepository.findOne({ query: { slug, deleted: null } });
  if (!card) throwAppError(MESSAGES.CARD_NOT_FOUND, 'NF01');

  await creatorCardRepository.updateOne({
    query: { slug },
    updateValues: { deleted: Date.now() },
  });

  const deletedCard = await creatorCardRepository.findOne({ query: { slug } });

  return serializeCard(deletedCard, { includeAccessCode: true });
}

module.exports = deleteCreatorCard;
