# Deployment Guide

This document describes how to deploy Gestão Solo to production with automated database migrations.

## Prerequisites

- GitHub repository with Actions enabled
- Supabase production project
- Supabase CLI access token

## GitHub Secrets Configuration

The following secrets must be configured in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Required Secrets

| Secret Name | Description | How to Get |
| ------------ | ------------- | ------------ |
| `SUPABASE_PROJECT_REF` | Your Supabase project reference ID | Found in Supabase Dashboard → Project Settings → General → Reference ID |
| `SUPABASE_ACCESS_TOKEN` | Personal access token for Supabase CLI | Generate at: <https://supabase.com/dashboard/account/tokens> |
| `VITE_SUPABASE_URL` | Your Supabase project URL | Found in Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable API key | Found in Supabase Dashboard → Project Settings → API → anon/public key |

### How to Add Secrets

1. Go to your GitHub repository
2. Navigate to `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret`
4. Add each secret with the name and value from the table above

## Automated Workflows

### 1. Migration Workflow (`.github/workflows/migrate.yml`)

**Purpose:** Handles all database schema changes independently.

Triggers on:

- Push to `main` branch when migration files change (`supabase/migrations/**`)
- Manual trigger via `workflow_dispatch`

Steps:

1. Checks out code
2. Sets up Bun environment
3. Links to Supabase production project
4. Pushes all pending migrations
5. Verifies migration status

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

**Purpose:** Builds and deploys the application (assumes migrations already applied).

Triggers on:

- Push to `main` branch
- Manual trigger via `workflow_dispatch`

Steps:

1. Checks out code
2. Sets up Bun environment
3. Installs dependencies
4. Builds the project with production environment variables
5. Deploys to GitHub Pages

**Note:** This workflow does NOT run migrations. Migrations are handled exclusively by the Migration Workflow to avoid race conditions and redundant executions.

## Workflow Execution Order

### Typical Deployment Flow

When you push changes that include both migrations and code:

1. **Migration workflow runs first** (triggered by migration file changes)
   - Applies schema changes to production database
   - Completes in ~30-60 seconds

2. **Deploy workflow runs** (triggered by push to main)
   - Builds app with updated code that expects new schema
   - Deploys to GitHub Pages

Both workflows run automatically, but migrations complete first ensuring the database is ready for the new code.

### Manual Triggers

**Run migrations only** (without deploying):

1. Go to GitHub repository → `Actions` tab
2. Select `Run Database Migrations` workflow
3. Click `Run workflow` → select branch → `Run workflow`

**Deploy only** (without running migrations):

1. Go to GitHub repository → `Actions` tab
2. Select `Deploy to static build to Github Pages` workflow
3. Click `Run workflow` → select branch → `Run workflow`

## Local Development Setup

For local development with migrations:

```bash
# Start local Supabase
bunx supabase start

# Create a new migration
bunx supabase migration new migration_name

# Apply migrations locally
bunx supabase migration up

# Reset local database (caution: deletes all data)
bunx supabase db reset
```

## Production Migration Process

### Safe Migration Workflow

1. **Develop locally:**

   ```bash
   bunx supabase migration new add_feature_x
   # Edit the generated SQL file
   bunx supabase db reset  # Test migration from scratch
   ```

2. **Test thoroughly:**
   - Run the app locally with the new schema
   - Verify all queries work
   - Test edge cases

3. **Commit and push:**

   ```bash
   git add supabase/migrations/
   git commit -m "feat: add feature X database schema"
   git push origin main
   ```

4. **Automatic deployment:**
   - **Migration workflow** automatically runs (detects migration file changes)
   - Check the Actions tab for migration status
   - Once migrations complete successfully, the **deploy workflow** runs
   - Both workflows run independently (migrations first, then deploy)

### Rollback Strategy

If a migration causes issues in production:

1. **Immediate fix:** Create a new migration that reverts the changes

   ```bash
   bunx supabase migration new rollback_feature_x
   # Add SQL to undo previous migration
   git add . && git commit -m "fix: rollback feature X" && git push
   ```

2. **Database restore:** Use Supabase Dashboard to restore from a backup
   - Go to Database → Backups
   - Restore to a point before the problematic migration
   - Redeploy with fixed migrations

## Migration Best Practices

### DO ✅

- **Test migrations locally** before pushing
- **Use transactions** in migrations (implicit in Supabase)
- **Keep migrations small** and focused
- **Add comments** explaining complex changes
- **Use idempotent operations** where possible (`CREATE TABLE IF NOT EXISTS`)
- **Include rollback SQL** in migration file comments

### DON'T ❌

- **Don't modify existing migrations** after they've been deployed
- **Don't drop tables** without backing up data first
- **Don't add NOT NULL constraints** to columns with existing null data
- **Don't rely on data existing** in migrations (data may vary between environments)

## Monitoring

### Check Migration Status

In GitHub Actions:

1. Go to `Actions` tab
2. Select latest workflow run
3. Check the "Run database migrations" step

In Supabase Dashboard:

1. Go to `Database` → `Migrations`
2. View applied migrations and timestamps

### Common Issues

#### Migration fails with "relation already exists"

**Cause:** Migration was partially applied or table already exists.

**Solution:** Use `IF NOT EXISTS` clauses:

```sql
CREATE TABLE IF NOT EXISTS public.my_table (...);
```

#### Permission denied errors

**Cause:** `SUPABASE_ACCESS_TOKEN` is invalid or expired.

**Solution:**

1. Generate a new token at <https://supabase.com/dashboard/account/tokens>
2. Update the GitHub secret

#### Migration succeeds but app doesn't work

**Cause:** Mismatch between database schema and application code.

**Solution:**

1. Check that TypeScript types match the new schema
2. Verify Supabase client queries use correct column names
3. Ensure RLS policies are correctly configured

## Deployment Checklist

Before deploying to production:

- [ ] Migrations tested locally with `bunx supabase db reset`
- [ ] All GitHub secrets configured correctly
- [ ] TypeScript types match database schema
- [ ] RLS policies tested and secured
- [ ] No hardcoded test data in migrations
- [ ] Rollback plan documented
- [ ] Team notified of schema changes

After pushing migrations:

- [ ] Check GitHub Actions → Migration workflow completed successfully
- [ ] Verify migration applied in Supabase Dashboard → Database → Migrations
- [ ] Wait for migration workflow to complete before manually triggering deploy (if needed)

## Support

For issues with:

- **GitHub Actions:** Check workflow logs in Actions tab
- **Supabase migrations:** Check Supabase Dashboard → Database → Migrations
- **Local development:** Check Supabase logs with `bunx supabase status`
