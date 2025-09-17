const { initializeDatabase } = require('../config/database');

async function main() {
  console.log('🏗️  Starting database initialization...');
  
  try {
    await initializeDatabase();
    console.log('✅ Database initialization completed successfully!');
    console.log('');
    console.log('Default admin credentials:');
    console.log('Email: admin@crm-hrms.com');
    console.log('Password: admin123');
    console.log('');
    console.log('📝 Please change the default admin password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

main();