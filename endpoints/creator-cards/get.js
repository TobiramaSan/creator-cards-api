const { createHandler } = require('@app-core/server');
const getCreatorCard = require('@app/services/creator-cards/get');
const MESSAGES = require('@app/messages/creator-cards');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async handler(rc, helpers) {
    const { slug } = rc.params;
    const { access_code: accessCode } = rc.query;
    const data = await getCreatorCard(slug, accessCode);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: MESSAGES.CARD_RETRIEVED,
      data,
    };
  },
});
