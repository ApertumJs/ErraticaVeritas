import { pgTable, text, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';

export const users = pgTable(
	'users',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull().unique(),
		emailVerified: boolean('email_verified').notNull(),
		image: text('image'),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at').notNull(),
		stripeCustomerId: text('stripe_customer_id'),
		role: text('role'),
		banned: boolean('banned'),
		banReason: text('ban_reason'),
		banExpires: timestamp('ban_expires')
	},
	(t) => [index('email_idx').on(t.email)]
);

export const sessions = pgTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at').notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		impersonatedBy: text('impersonated_by')
	},
	(t) => [index('user_id_idx_sessions').on(t.userId), index('token_idx').on(t.token)]
);

export const accounts = pgTable(
	'accounts',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at').notNull()
	},
	(t) => [index('user_id_idx_accounts').on(t.userId)]
);

export const verifications = pgTable(
	'verifications',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at'),
		updatedAt: timestamp('updated_at')
	},
	(t) => [index('identifier_idx').on(t.identifier)]
);

export const subscriptions = pgTable(
	'subscriptions',
	{
		id: text('id').primaryKey(),
		plan: text('plan').notNull(),
		referenceId: text('reference_id').notNull(),
		stripeCustomerId: text('stripe_customer_id'),
		stripeSubscriptionId: text('stripe_subscription_id'),
		status: text('status'),
		periodStart: timestamp('period_start'),
		periodEnd: timestamp('period_end'),
		cancelAtPeriodEnd: boolean('cancel_at_period_end'),
		seats: integer('seats')
	},
	(t) => [index('stripe_customer_id_idx').on(t.stripeCustomerId)]
);
