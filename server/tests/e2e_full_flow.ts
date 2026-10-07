import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function runE2ETests() {
  console.log('====================================================');
  console.log('🧪 RUNNING END-TO-END SYSTEM INTEGRATION TESTS');
  console.log('====================================================');

  // Step 1: Health Check
  console.log('1. Checking Server Health...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(healthRes.status, 200);
  const healthJson = await healthRes.json();
  assert.strictEqual(healthJson.status, 'ok');
  console.log('✓ Health check passed');

  // Step 2: SPA Frontend Routes Delivery
  console.log('\n2. Verifying SPA HTML & Asset Delivery...');
  const routes = ['/', '/login', '/signup', '/accessibility', '/dashboard', '/history', '/settings'];
  for (const r of routes) {
    const res = await fetch(`${BASE_URL}${r}`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('id="root"'), `Route ${r} should render root element`);
    assert.ok(text.includes('Accessibility'), `Route ${r} should contain Accessibility brand`);
  }
  console.log('✓ All 7 frontend routes delivered successfully with 200 OK');

  // Step 3: User Registration Flow
  console.log('\n3. Testing User Registration...');
  const testEmail = `inclusion_user_${Date.now()}@example.com`;
  const testPassword = 'SafePassword123!';

  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  assert.strictEqual(signupRes.status, 201);
  const signupData = await signupRes.json();
  assert.ok(signupData.user?.id);
  assert.ok(signupData.token);
  const userToken = signupData.token;
  console.log('✓ User registered successfully:', signupData.user.email);

  // Step 4: Verify Current Session (GET /api/auth/me)
  console.log('\n4. Verifying Authenticated Session...');
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.strictEqual(meRes.status, 200);
  const meData = await meRes.json();
  assert.strictEqual(meData.user.id, signupData.user.id);
  console.log('✓ Session verified for user:', meData.user.id);

  // Step 5: Accessibility Profile Updates (PUT /api/profile)
  console.log('\n5. Testing Accessibility Profile Preferences...');
  const profileRes = await fetch(`${BASE_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.strictEqual(profileRes.status, 200);
  const profileData = await profileRes.json();
  assert.ok(profileData.profile);

  const updateProfileRes = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      visualAssistance: true,
      hearingAssistance: false,
      cognitiveAssistance: true,
      readingAssistance: true,
      languageAssistance: false,
      screenReaderMode: true,
      preferredLanguage: 'Telugu',
    }),
  });
  assert.strictEqual(updateProfileRes.status, 200);
  const updatedProfile = await updateProfileRes.json();
  assert.strictEqual(updatedProfile.profile.screenReaderMode, true);
  assert.strictEqual(updatedProfile.profile.preferredLanguage, 'Telugu');
  console.log('✓ Accessibility profile updated and persisted');

  // Step 6: AI Transformation (POST /api/transform)
  console.log('\n6. Testing AI Accessibility Transformation with Gemini...');
  const complexNotice = 'Patients experiencing severe acute respiratory distress should immediately terminate strenuous physical exertion and consult a medical practitioner.';

  const transformRes = await fetch(`${BASE_URL}/api/transform`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      content: complexNotice,
      task: 'simplify',
      accessibilityNeed: 'cognitive',
      language: 'English',
      additionalInstructions: 'Make it direct and clear for all readers',
      save: true,
    }),
  });
  assert.strictEqual(transformRes.status, 200);
  const transformData = await transformRes.json();
  assert.strictEqual(transformData.success, true);
  assert.ok(transformData.data?.result, 'Should have simplified result');
  assert.ok(typeof transformData.data.accessibilityScore === 'number');
  assert.ok(transformData.data.accessibilityScore >= 0 && transformData.data.accessibilityScore <= 100);
  assert.ok(Array.isArray(transformData.data.suggestions));
  assert.ok(transformData.savedRecord?.id);
  const savedRecordId = transformData.savedRecord.id;

  console.log('✓ AI Transformation Result:');
  console.log('  Original:', complexNotice);
  console.log('  Simplified:', transformData.data.result);
  console.log('  Accessibility Score:', transformData.data.accessibilityScore, '/ 100');
  console.log('  Saved Record ID:', savedRecordId);

  // Step 7: History Retrieval (GET /api/history)
  console.log('\n7. Testing History Retrieval...');
  const historyRes = await fetch(`${BASE_URL}/api/history`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.strictEqual(historyRes.status, 200);
  const historyData = await historyRes.json();
  assert.ok(Array.isArray(historyData.history));
  const found = historyData.history.find((h: any) => h.id === savedRecordId);
  assert.ok(found, 'Saved transformation should be in history');
  console.log('✓ Record confirmed in history list');

  // Step 8: History Detail View (GET /api/history/:id)
  console.log('\n8. Testing History Detail View...');
  const detailRes = await fetch(`${BASE_URL}/api/history/${savedRecordId}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.strictEqual(detailRes.status, 200);
  const detailData = await detailRes.json();
  assert.strictEqual(detailData.transformation.id, savedRecordId);
  console.log('✓ History detail retrieved');

  // Step 9: Cross-User Data Isolation (Security Check)
  console.log('\n9. Testing Security & Data Isolation (Cross-User Unauthorized Access)...');
  // Register a second distinct user
  const user2Res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `attacker_${Date.now()}@example.com`, password: 'OtherPassword123!' }),
  });
  const user2Data = await user2Res.json();
  const user2Token = user2Data.token;

  // User 2 attempts to fetch User 1's transformation
  const unauthorizedRes = await fetch(`${BASE_URL}/api/history/${savedRecordId}`, {
    headers: { Authorization: `Bearer ${user2Token}` },
  });
  assert.strictEqual(unauthorizedRes.status, 404, 'User 2 should receive 404 when querying User 1 record');

  // User 2 attempts to delete User 1's transformation
  const unauthorizedDeleteRes = await fetch(`${BASE_URL}/api/history/${savedRecordId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${user2Token}` },
  });
  assert.strictEqual(unauthorizedDeleteRes.status, 404, 'User 2 should receive 404 when attempting delete on User 1 record');
  console.log('✓ SECURITY VERIFIED: User 2 was completely blocked from viewing or deleting User 1 data');

  // Step 10: Authorized Deletion (DELETE /api/history/:id)
  console.log('\n10. Testing Authorized Deletion...');
  const deleteRes = await fetch(`${BASE_URL}/api/history/${savedRecordId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.strictEqual(deleteRes.status, 200);
  console.log('✓ Record deleted by authorized owner');

  // Verify record is gone
  const verifyGoneRes = await fetch(`${BASE_URL}/api/history/${savedRecordId}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.strictEqual(verifyGoneRes.status, 404);
  console.log('✓ Verified record no longer exists');

  // Step 11: Logout Flow (POST /api/auth/logout)
  console.log('\n11. Testing Logout Flow...');
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.strictEqual(logoutRes.status, 200);

  // Verify session invalidated
  const postLogoutMe = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.strictEqual(postLogoutMe.status, 401, 'Invalidated session must return 401');
  console.log('✓ Session successfully invalidated upon logout');

  console.log('\n====================================================');
  console.log('🎉 ALL END-TO-END TESTS PASSED WITH 100% SUCCESS!');
  console.log('====================================================');
}

runE2ETests().catch((err) => {
  console.error('E2E Test Failure:', err);
  process.exit(1);
});
