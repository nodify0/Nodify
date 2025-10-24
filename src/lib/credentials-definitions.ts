import type { CredentialDefinition } from './credentials-types';

// Note: Next.js 13+ with Turbopack does not support webpack's require.context.
// Import credential definitions explicitly to ensure compatibility.
import airtable from '@/credentials/airtable.credential';
import apiKey from '@/credentials/apiKey.credential';
import bearerToken from '@/credentials/bearerToken.credential';
import discord from '@/credentials/discord.credential';
import github from '@/credentials/github.credential';
import googleApi from '@/credentials/googleApi.credential';
import httpAuth from '@/credentials/httpAuth.credential';
import notion from '@/credentials/notion.credential';
import oauth2 from '@/credentials/oauth2.credential';
import openAi from '@/credentials/openAi.credential';
import sendgrid from '@/credentials/sendgrid.credential';
import slack from '@/credentials/slack.credential';
import stripe from '@/credentials/stripe.credential';
import telegram from '@/credentials/telegram.credential';
import twilio from '@/credentials/twilio.credential';

export const credentialDefinitions: CredentialDefinition[] = [
  airtable,
  apiKey,
  bearerToken,
  discord,
  github,
  googleApi,
  httpAuth,
  notion,
  oauth2,
  openAi,
  sendgrid,
  slack,
  stripe,
  telegram,
  twilio,
];
