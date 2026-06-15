/* eslint-disable camelcase */
const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const creatorCardRepository = require('@app/repository/creator-card');
const MESSAGES = require('@app/messages/creator-cards');
const { generateSlugBase, generateSuffix, serializeCard } = require('./helpers');

const createSpec = `root {
  title string<trim|minLength:3|maxLength:100>
  description? string<maxLength:500>
  slug? string<trim|minLength:5|maxLength:50>
  creator_reference string<length:20>
  links[]? {
    title string<minLength:1|maxLength:100>
    url string<maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<minLength:3|maxLength:100>
      description? string<maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<length:6>
}`;

const parsedCreateSpec = validator.parse(createSpec);

async function createCreatorCard(data) {
  const validated = validator.validate(data, parsedCreateSpec);

  const {
    title,
    description,
    slug: inputSlug,
    creator_reference,
    links,
    service_rates,
    status,
  } = validated;
  const { access_type = 'public', access_code } = validated;

  if (access_type === 'private' && !access_code) {
    throwAppError(MESSAGES.ACCESS_CODE_REQUIRED, 'AC01');
  }

  if (access_type === 'public' && access_code) {
    throwAppError(MESSAGES.ACCESS_CODE_NOT_ALLOWED, 'AC05');
  }

  // access_code must be strictly alphanumeric (VSL handles length:6; format is an extra constraint)
  if (access_code && !/^[a-zA-Z0-9]{6}$/.test(access_code)) {
    throwAppError(MESSAGES.ACCESS_CODE_INVALID_FMT, 'VALIDATIONERR');
  }

  if (inputSlug && !/^[a-zA-Z0-9-_]+$/.test(inputSlug)) {
    throwAppError(MESSAGES.INVALID_SLUG_FORMAT, 'VALIDATIONERR');
  }

  if (links && links.length) {
    const invalidLink = links.find(
      (link) => !link.url.startsWith('http://') && !link.url.startsWith('https://')
    );
    if (invalidLink) throwAppError(MESSAGES.INVALID_LINK_URL, 'VALIDATIONERR');
  }

  if (service_rates && service_rates.rates) {
    const invalidRate = service_rates.rates.find((rate) => !Number.isInteger(rate.amount));
    if (invalidRate) throwAppError(MESSAGES.INVALID_RATE_AMOUNT, 'VALIDATIONERR');
  }

  let slug;
  if (inputSlug) {
    const existing = await creatorCardRepository.findOne({ query: { slug: inputSlug } });
    if (existing) throwAppError(MESSAGES.SLUG_TAKEN, 'SL02');
    slug = inputSlug;
  } else {
    let candidateSlug = generateSlugBase(title).slice(0, 43);
    const isTooShort = candidateSlug.length < 5;
    const isTaken =
      !isTooShort && !!(await creatorCardRepository.findOne({ query: { slug: candidateSlug } }));
    if (isTooShort || isTaken) candidateSlug = `${candidateSlug}-${generateSuffix()}`;
    slug = candidateSlug;
  }

  const cardData = {
    title,
    ...(description !== undefined && { description }),
    slug,
    creator_reference,
    links: links || [],
    service_rates: service_rates || null,
    status,
    access_type,
    access_code: access_type === 'private' ? access_code : null,
    deleted: null,
  };

  const created = await creatorCardRepository.create(cardData);
  return serializeCard(created, { includeAccessCode: true });
}

module.exports = createCreatorCard;
