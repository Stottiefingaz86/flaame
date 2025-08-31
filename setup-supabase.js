#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Flame Battles - Supabase Setup\n');

const questions = [
  {
    name: 'supabaseUrl',
    message: 'Enter your Supabase Project URL (e.g., https://your-project.supabase.co): ',
    validate: (input) => input.startsWith('https://') && input.includes('supabase.co')
  },
  {
    name: 'supabaseAnonKey',
    message: 'Enter your Supabase anon/public key (starts with eyJ...): ',
    validate: (input) => input.startsWith('eyJ')
  },
  {
    name: 'instagramClientId',
    message: 'Enter your Instagram Client ID (optional, press Enter to skip): ',
    validate: () => true
  },
  {
    name: 'instagramClientSecret',
    message: 'Enter your Instagram Client Secret (optional, press Enter to skip): ',
    validate: () => true
  }
];

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=SUPABASE_URL_PLACEHOLDER
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY_PLACEHOLDER

# Instagram OAuth (for production)
INSTAGRAM_CLIENT_ID=INSTAGRAM_CLIENT_ID_PLACEHOLDER
INSTAGRAM_CLIENT_SECRET=INSTAGRAM_CLIENT_SECRET_PLACEHOLDER
NEXT_PUBLIC_BASE_URL=http://localhost:3000
`;

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.message, (answer) => {
      if (question.validate && !question.validate(answer)) {
        console.log('❌ Invalid input. Please try again.');
        resolve(askQuestion(question));
      } else {
        resolve(answer);
      }
    });
  });
}

async function setup() {
  try {
    const answers = {};
    
    for (const question of questions) {
      answers[question.name] = await askQuestion(question);
    }

    // Create .env.local file
    let envFile = envContent
      .replace('SUPABASE_URL_PLACEHOLDER', answers.supabaseUrl)
      .replace('SUPABASE_ANON_KEY_PLACEHOLDER', answers.supabaseAnonKey);

    if (answers.instagramClientId && answers.instagramClientSecret) {
      envFile = envFile
        .replace('INSTAGRAM_CLIENT_ID_PLACEHOLDER', answers.instagramClientId)
        .replace('INSTAGRAM_CLIENT_SECRET_PLACEHOLDER', answers.instagramClientSecret);
    } else {
      envFile = envFile
        .replace('INSTAGRAM_CLIENT_ID_PLACEHOLDER', '')
        .replace('INSTAGRAM_CLIENT_SECRET_PLACEHOLDER', '');
    }

    fs.writeFileSync('.env.local', envFile);

    console.log('\n✅ Environment variables configured successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the database schema in your Supabase dashboard');
    console.log('2. Restart your development server: npm run dev');
    console.log('3. Visit http://localhost:3000 to test your setup');
    console.log('\n📖 For detailed instructions, see SUPABASE_SETUP.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup();
