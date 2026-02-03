/**
 * User Data Migration Script
 *
 * This script migrates user dreams from embedded array to dreams collection.
 *
 * TEMPORARY - DELETE AFTER MIGRATION IS COMPLETE
 *
 * Usage:
 *   npx ts-node scripts/migrate-user-data.ts
 *   Or with custom URL: EXPO_PUBLIC_API_URL=https://your-backend.com npx ts-node scripts/migrate-user-data.ts migrate-all
 */

// Remove trailing /api if present (we'll add it back in the endpoints)
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://packslight-expo-backend-production.up.railway.app/api';
const API_BASE_URL = rawApiUrl.replace(/\/api\/?$/, '');

interface MigrationResult {
  success: boolean;
  message: string;
  user_id: string;
  dreams_migrated: number;
  already_migrated: number;
  total_dreams: number;
  dreams_summary_created: number;
}

interface MigrationStatus {
  user_id: string;
  has_old_dreams_array: boolean;
  old_dreams_count: number;
  has_dreams_summary: boolean;
  dreams_summary_count: number;
  dreams_in_collection: number;
  migration_complete: boolean;
  needs_migration: boolean;
}

interface AllUsersMigrationResult {
  success: boolean;
  message: string;
  total_users: number;
  users_migrated: number;
  users_skipped: number;
  total_dreams_migrated: number;
  errors: string[];
  error_count: number;
}

/**
 * Check migration status for a user
 */
async function checkMigrationStatus(userId: string): Promise<MigrationStatus> {
  console.log(`\n📊 Checking migration status for user: ${userId}`);

  const response = await fetch(`${API_BASE_URL}/api/migration/migration-status/${userId}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const status = await response.json() as MigrationStatus;

  console.log('Status:', {
    'Old dreams': status.old_dreams_count,
    'Dreams summary': status.dreams_summary_count,
    'Dreams in collection': status.dreams_in_collection,
    'Migration complete': status.migration_complete ? '✅' : '❌',
    'Needs migration': status.needs_migration ? '⚠️  YES' : '✅ NO'
  });

  return status;
}

/**
 * Migrate a single user's dreams
 */
async function migrateSingleUser(userId: string): Promise<MigrationResult> {
  console.log(`\n🚀 Starting migration for user: ${userId}`);

  const response = await fetch(`${API_BASE_URL}/api/migration/migrate-user/${userId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
  }

  const result = await response.json() as MigrationResult;

  console.log('\n✅ Migration completed!');
  console.log('Results:', {
    'Dreams migrated': result.dreams_migrated,
    'Already migrated': result.already_migrated,
    'Total dreams': result.total_dreams,
    'Dreams summary created': result.dreams_summary_created
  });

  return result;
}

/**
 * Migrate all users at once
 */
async function migrateAllUsers(): Promise<AllUsersMigrationResult> {
  console.log('\n🚀 Starting migration for ALL users...');
  console.log('⚠️  This may take a while depending on the number of users!\n');

  const response = await fetch(`${API_BASE_URL}/api/migration/migrate-all-users`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
  }

  const result = await response.json() as AllUsersMigrationResult;

  console.log('\n✅ All users migration completed!');
  console.log('Results:', {
    'Total users': result.total_users,
    'Users migrated': result.users_migrated,
    'Users skipped': result.users_skipped,
    'Total dreams migrated': result.total_dreams_migrated,
    'Errors': result.error_count
  });

  if (result.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }

  return result;
}

/**
 * Clean up old dreams array (ONLY after verifying migration)
 */
async function cleanupOldDreams(userId: string): Promise<void> {
  console.log(`\n🧹 Cleaning up old dreams array for user: ${userId}`);
  console.log('⚠️  This will permanently remove the old dreams array!');

  const response = await fetch(`${API_BASE_URL}/api/migration/cleanup-old-dreams/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
  }

  const result = await response.json();

  console.log('✅ Cleanup completed!');
  console.log('Result:', result);
}

/**
 * Interactive CLI menu
 */
async function showMenu() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄  USER DATA MIGRATION TOOL');
  console.log('='.repeat(60));
  console.log('\nAvailable commands:');
  console.log('  1. Check migration status for a user');
  console.log('  2. Migrate single user');
  console.log('  3. Migrate ALL users (use with caution!)');
  console.log('  4. Cleanup old dreams array (after verifying)');
  console.log('  5. Exit');
  console.log('='.repeat(60));
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  // Check if API is reachable
  try {
    console.log(`\n🔗 Checking connection to: ${API_BASE_URL}`);
    const response = await fetch(`${API_BASE_URL}/`);
    console.log(`✅ Connected! (Status: ${response.status})`);
  } catch (error) {
    console.error('❌ Cannot connect to API server!');
    console.error('Make sure the backend is running and EXPO_PUBLIC_API_URL is set correctly.');
    process.exit(1);
  }

  // Parse command line arguments
  const command = args[0];
  const userId = args[1];

  if (command === 'status' && userId) {
    await checkMigrationStatus(userId);
  } else if (command === 'migrate' && userId) {
    await migrateSingleUser(userId);
  } else if (command === 'migrate-all') {
    console.log('\n⚠️  WARNING: This will migrate ALL users!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await migrateAllUsers();
  } else if (command === 'cleanup' && userId) {
    console.log('\n⚠️  WARNING: This will permanently remove old dreams array!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await cleanupOldDreams(userId);
  } else {
    // Show usage
    console.log('\n📖 Usage:');
    console.log('  Check status:    npx ts-node scripts/migrate-user-data.ts status <user_id>');
    console.log('  Migrate user:    npx ts-node scripts/migrate-user-data.ts migrate <user_id>');
    console.log('  Migrate all:     npx ts-node scripts/migrate-user-data.ts migrate-all');
    console.log('  Cleanup:         npx ts-node scripts/migrate-user-data.ts cleanup <user_id>');
    console.log('\nExamples:');
    console.log('  npx ts-node scripts/migrate-user-data.ts status ABC123');
    console.log('  npx ts-node scripts/migrate-user-data.ts migrate ABC123');
    console.log('  npx ts-node scripts/migrate-user-data.ts migrate-all');
    console.log('  npx ts-node scripts/migrate-user-data.ts cleanup ABC123');
    console.log('');
  }
}

// Run the script
main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
