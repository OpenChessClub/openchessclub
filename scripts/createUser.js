require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const readline = require('readline');
const mongoose = require('mongoose');
const User = require('../models/User');

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in .env, or the path is incorrect. Please ensure .env is in the root folder.');
  process.exit(1);
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');
  } 
  catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    if (!hidden) return rl.question(question, resolve);

    const onData = (char) => {
      char = String(char);
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.pause();
          break;
        default:
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(question + Array(rl.line.length + 1).join('*'));
          break;
      }
    };

    process.stdin.on('data', onData);

    rl.question(question, (value) => {
      process.stdin.removeListener('data', onData);
      rl.history = rl.history.slice(1);
      process.stdout.write('\n');
      resolve(value);
    });
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function promptUser() {
  console.log('Create New User');
  console.log('-------------------');

  let email;
  do {
    email = (await ask('Email: ')).trim();
    if (!isValidEmail(email)) console.log('Invalid email format.');
  } while (!isValidEmail(email));

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('That email is already registered.');
    process.exit(0);
  }

  let name;
  do {
    name = (await ask('Name: ')).trim();
    if (!name) console.log('Name cannot be empty.');
  } while (!name);

  let role;
  const allowedRoles = ['admin', 'user'];
  do {
    role = (await ask('Role (admin/user): ')).trim().toLowerCase();
    if (!allowedRoles.includes(role)) console.log('Role must be "admin" or "user".');
  } while (!allowedRoles.includes(role));

  let password;
  do {
    password = await ask('Password: ', { hidden: true });
    if (!password || password.length < 6) console.log('Password too short (min 6 characters).');
  } while (!password || password.length < 6);

  return { email, password, role, name };
}

async function main() {
  await connectDB();

  try {
    const { email, password, role, name } = await promptUser();

    const user = new User({ email, password, role, name });
    await user.save();

    console.log('\n User created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Role: ${role}`);

  } 
  catch (err) {
    console.error('\n Error:', err);
  } 
  finally {
    rl.close();
    await mongoose.disconnect();
  }
}

main();
