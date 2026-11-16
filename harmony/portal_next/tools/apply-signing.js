'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const signingPath = path.join(root, 'signing.local.json');
const profilePath = path.join(root, 'build-profile.json5');
const required = ['storeFile', 'storePassword', 'keyAlias', 'keyPassword', 'profile', 'certpath'];

const signing = JSON.parse(fs.readFileSync(signingPath, 'utf8'));
for (const key of required) {
  if (!signing[key]) {
    console.error('signing.local.json is missing ' + key);
    process.exit(1);
  }
}

const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
profile.app.signingConfigs[0].material = {
  storeFile: signing.storeFile,
  storePassword: signing.storePassword,
  keyAlias: signing.keyAlias,
  keyPassword: signing.keyPassword,
  signAlg: signing.signAlg || 'SHA256withECDSA',
  profile: signing.profile,
  certpath: signing.certpath
};
fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2) + '\n');
