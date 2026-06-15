const { createHandler } = require('@app-core/server');
const deleteCreatorCard = require('@app/services/creator-cards/delete');
const MESSAGES = require('@app/messages/creator-cards');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async handler(rc, helpers) {
    const { slug } = rc.params;
    const data = await deleteCreatorCard(slug, rc.body);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: MESSAGES.CARD_DELETED,
      data,
    };
  },
});
