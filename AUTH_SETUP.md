# Authentication Setup Instructions

## 1. Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it into `.env.local` as `ENCRYPTION_KEY`.

## 2. Generate NextAuth Secret

Run this command:

```bash
openssl rand -base64 32
```

Copy the output and paste it into `.env.local` as `NEXTAUTH_SECRET`.

## 3. Configure Azure AD SSO (Optional)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Name: "NextDocs"
5. Redirect URI: `http://localhost:9980/api/auth/callback/azure-ad`
6. Click **Register**
7. Copy the **Application (client) ID** → paste as `AZURE_AD_CLIENT_ID`
8. Copy the **Directory (tenant) ID** → paste as `AZURE_AD_TENANT_ID`
9. Go to **Certificates & secrets** → **New client secret**
10. Copy the secret value → paste as `AZURE_AD_CLIENT_SECRET`

## 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with test users
npm run db:seed
```

## 5. Test Credentials

After seeding, you can login with:

- **Admin**: admin@harveynorman.com / admin123
- **Editor**: editor@harveynorman.com / editor123  
- **User**: user@harveynorman.com / user123

## 6. Start Development Server

```bash
npm run dev
```

Visit http://localhost:9980 to see the application.

## Security Notes

- Change all default passwords in production
- Use strong, unique secrets for `NEXTAUTH_SECRET` and `ENCRYPTION_KEY`
- Never commit `.env.local` to version control
- Configure proper Azure AD app roles for production
