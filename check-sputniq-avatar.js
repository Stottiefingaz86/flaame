const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing Supabase credentials. Please set:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSputniqAvatar() {
  try {
    console.log('🔍 Checking Sputniq\'s avatar...\n');
    
    // 1. Get Sputniq's profile data
    console.log('1. Getting Sputniq\'s profile data...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, avatar_id')
      .eq('username', 'Sputniq')
      .single();
    
    if (profileError) {
      console.error('❌ Error getting profile:', profileError);
      return;
    }
    
    if (!profile) {
      console.log('❌ Sputniq profile not found');
      return;
    }
    
    console.log('✅ Profile found:', {
      id: profile.id,
      username: profile.username,
      avatar_id: profile.avatar_id
    });
    
    // 2. List all files in avatars bucket
    console.log('\n2. Listing all files in avatars bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 100 });
    
    if (listError) {
      console.error('❌ Error listing files:', listError);
      return;
    }
    
    console.log('✅ Files in avatars bucket:');
    files.forEach(file => {
      console.log(`  - ${file.name} (${file.metadata?.size || 'unknown size'})`);
    });
    
    // 3. Check if Sputniq's avatar file exists
    if (profile.avatar_id) {
      console.log(`\n3. Checking if avatar file exists: ${profile.avatar_id}`);
      
      // Try different possible paths
      const possiblePaths = [
        profile.avatar_id,
        `avatars/${profile.avatar_id}`,
        `avatars/${profile.id}-${profile.avatar_id}`,
        `avatars/${profile.id}`
      ];
      
      for (const path of possiblePaths) {
        console.log(`  Testing path: ${path}`);
        const { data, error } = await supabase.storage
          .from('avatars')
          .download(path);
        
        if (error) {
          console.log(`    ❌ Not found: ${error.message}`);
        } else {
          console.log(`    ✅ Found! File size: ${data.size} bytes`);
          break;
        }
      }
    } else {
      console.log('\n3. ❌ Sputniq has no avatar_id set');
    }
    
    // 4. Check for any files that might be Sputniq's avatar
    console.log('\n4. Looking for files that might be Sputniq\'s avatar...');
    const sputniqFiles = files.filter(file => 
      file.name.includes('sputniq') || 
      file.name.includes(profile.id) ||
      file.name.toLowerCase().includes('sputniq')
    );
    
    if (sputniqFiles.length > 0) {
      console.log('✅ Potential Sputniq avatar files:');
      sputniqFiles.forEach(file => {
        console.log(`  - ${file.name}`);
      });
    } else {
      console.log('❌ No files found that might be Sputniq\'s avatar');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSputniqAvatar();
