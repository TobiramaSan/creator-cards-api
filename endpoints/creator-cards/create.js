const { createHandler } = require('@app-core/server');
const createCreatorCard = require('@app/services/creator-cards/create');
const MESSAGES = require('@app/messages/creator-cards');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  middlewares: [],
  async handler(rc, helpers) {
    const data = await createCreatorCard(rc.body);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: MESSAGES.CARD_CREATED,
      data,
    };
  },
});
