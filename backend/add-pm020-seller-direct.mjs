import pkg from 'pg';
const { Client } = pkg;

async function addPM020ToSeller() {
  const client = new Client({
    connectionString: 'postgresql://postgres:240499@localhost:5432/i_contexchange?schema=public'
  });

  try {
    await client.connect();
    console.log('\n=== Adding PM-020 (CREATE_RFQ) to Seller Role ===\n');
    
    // Step 1: Check if permission exists
    const permCheck = await client.query(
      `SELECT * FROM permissions WHERE code = 'PM-020'`
    );
    
    if (permCheck.rows.length === 0) {
      console.log('❌ Permission PM-020 does not exist!');
      return;
    }
    
    console.log(`✅ Found permission: ${permCheck.rows[0].code} - ${permCheck.rows[0].name}`);
    
    // Step 2: Check current seller permissions
    const currentPerms = await client.query(`
      SELECT p.code, p.name, p.description 
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'seller'
      ORDER BY p.code
    `);
    
    console.log(`\n📋 Current seller permissions (${currentPerms.rows.length} total):`);
    currentPerms.rows.forEach((p, i) => {
      console.log(`${i + 1}. ${p.code} - ${p.name}`);
    });
    
    // Check if already has PM-020
    const hasPM020 = currentPerms.rows.some(p => p.code === 'PM-020');
    if (hasPM020) {
      console.log('\n⚠️  Seller already has PM-020 permission! No action needed.\n');
      return;
    }
    
    // Step 3: Add PM-020 to seller role
    console.log('\n🔄 Adding PM-020 to seller role...');
    
    const addPerm = await client.query(`
      INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
      SELECT 
        r.id as role_id,
        p.id as permission_id,
        NOW() as created_at,
        NOW() as updated_at
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.code = 'seller' 
        AND p.code = 'PM-020'
        AND NOT EXISTS (
          SELECT 1 FROM role_permissions rp 
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
      RETURNING *
    `);
    
    console.log(`✅ Permission added successfully!`);
    
    // Step 4: Increment role version to force users to re-login
    console.log('🔄 Updating role version...');
    
    await client.query(`
      UPDATE roles 
      SET role_version = role_version + 1,
          updated_at = NOW()
      WHERE code = 'seller'
    `);
    
    console.log('✅ Role version incremented');
    
    // Step 5: Update permissions_updated_at for all seller users
    console.log('🔄 Forcing seller users to re-login...');
    
    const updateUsers = await client.query(`
      UPDATE users 
      SET permissions_updated_at = NOW()
      WHERE id IN (
        SELECT DISTINCT user_id 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE r.code = 'seller'
      )
      RETURNING email, permissions_updated_at
    `);
    
    console.log(`✅ Updated ${updateUsers.rows.length} seller user(s) - they need to re-login`);
    updateUsers.rows.forEach(u => {
      console.log(`   - ${u.email}`);
    });
    
    // Step 6: Verify the change
    const updatedPerms = await client.query(`
      SELECT p.code, p.name, p.description 
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'seller'
      ORDER BY p.code
    `);
    
    console.log(`\n📋 Updated seller permissions (${updatedPerms.rows.length} total):`);
    updatedPerms.rows.forEach((p, i) => {
      const marker = p.code === 'PM-020' ? '🆕' : '  ';
      console.log(`${marker} ${i + 1}. ${p.code} - ${p.name}`);
    });
    
    console.log('\n✅ SUCCESS! Seller can now access RFQ menu!');
    console.log('⚠️  Important: Existing seller users MUST RE-LOGIN to see the change!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

addPM020ToSeller();
