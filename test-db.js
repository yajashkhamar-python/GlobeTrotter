import 'dotenv/config';
import fetch from 'node-fetch';

async function test() {
  try {
    // We need to login first or get a token, but I can just use fetchApi if I grab the token, or directly query the database.
    // Since I know the user is running the app, the server must be up.
  } catch (err) {
    console.error(err);
  }
}
test();
