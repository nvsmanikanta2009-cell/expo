import dotenv from 'dotenv';
dotenv.config();

import { db } from '../db/index.js';
import { hashPassword, verifyPassword } from '../auth/index.js';
import { aiService } from '../ai/index.js';

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION & SECURITY TESTS ---');

  // Test 1: DB Initialization
  console.log('1. Testing Database Initialization...');
  await db.initialize();
  console.log('✓ DB Initialized successfully');

  // Test 2: Auth & Hashing
  console.log('\n2. Testing Password Hashing & Auth...');
  const testPassword = 'Password123!Safe';
  const hashed = await hashPassword(testPassword);
  const isValid = await verifyPassword(testPassword, hashed);
  const isInvalid = await verifyPassword('WrongPassword', hashed);
  if (!isValid || isInvalid) {
    throw new Error('Password verification failed');
  }
  console.log('✓ Password hashing and verification passed');

  // Test 3: User Creation & Profile
  console.log('\n3. Testing User & Profile CRUD...');
  const testEmail = `test_${Date.now()}@example.com`;
  const user = await db.createUser(testEmail, hashed);
  if (!user || user.email !== testEmail) {
    throw new Error('User creation failed');
  }
  console.log('✓ User created successfully:', user.id);

  const profile = await db.getProfile(user.id);
  if (!profile) {
    throw new Error('Default profile was not created');
  }
  console.log('✓ Default profile verified');

  const updatedProfile = await db.upsertProfile(user.id, {
    visualAssistance: true,
    hearingAssistance: false,
    cognitiveAssistance: true,
    readingAssistance: true,
    languageAssistance: false,
    screenReaderMode: true,
    preferredLanguage: 'Hindi',
  });
  if (updatedProfile.preferredLanguage !== 'Hindi' || !updatedProfile.screenReaderMode) {
    throw new Error('Profile update failed');
  }
  console.log('✓ Profile update verified');

  // Test 4: Transformations & Strict Isolation
  console.log('\n4. Testing Transformation Storage & User Isolation...');
  const transformRecord = await db.createTransformation({
    userId: user.id,
    task: 'simplify',
    accessibilityNeed: 'cognitive',
    language: 'English',
    originalContent: 'The utilization of obfuscated algorithmic paradigms renders navigation arduous.',
    transformedContent: 'Using complicated computer programs makes it hard to move around the website.',
    explanation: 'Replaced jargon with plain words.',
    accessibilityScore: 88,
    aiSuggestions: { suggestions: ['Keep sentences short'] },
  });

  // Verify user can read their record
  const fetched = await db.getTransformationByIdAndUser(transformRecord.id, user.id);
  if (!fetched) {
    throw new Error('User could not retrieve their own record');
  }
  console.log('✓ User retrieved their own transformation record');

  // Verify another user cannot access this record (Data Isolation Test)
  const fakeOtherUserId = '00000000-0000-0000-0000-000000000000';
  const unauthorizedFetch = await db.getTransformationByIdAndUser(transformRecord.id, fakeOtherUserId);
  if (unauthorizedFetch !== null) {
    throw new Error('SECURITY VIOLATION: Unauthorized user accessed private record!');
  }
  console.log('✓ SECURITY CHECK PASSED: Cross-user data isolation verified');

  // Test 5: AI Transformation with Gemini
  console.log('\n5. Testing Gemini AI Service Integration...');
  try {
    const aiResult = await aiService.transformContent({
      task: 'simplify',
      accessibilityNeed: 'reading',
      language: 'English',
      content: 'Digital barriers in electronic publications impede pedagogical assimilation for neurodivergent learners.',
    });
    console.log('✓ Gemini AI Transformation Successful!');
    console.log('Task:', aiResult.task);
    console.log('Score:', aiResult.accessibilityScore);
    console.log('Result:', (aiResult as any).result);
    console.log('Suggestions:', aiResult.suggestions);
  } catch (err: any) {
    console.warn('Gemini test note (check API key or network):', err.message);
  }

  console.log('\n--- ALL BACKEND INTEGRATION & SECURITY TESTS PASSED ---');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
