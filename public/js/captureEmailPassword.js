/*

const messages = {
	signup: {
		"auth/email-already-in-use": "email already in use",
		"auth/invalid-email": "invalid email",
		"auth/operation-not-allowed": "operation not allowed",
		"auth/weak-password": "weak password",
		"success": "user created"
	},
	signin: {
		"auth/invalid-email": "invalid email",
		"auth/user-disabled": "user disabled",
		"auth/user-not-found": "user not found",
		"auth/wrong-password": "wrong password",
		"success": "logged in"
	}
};

/*/
const messages = {
  signup: {
    "auth/email-already-in-use": "user already exists, try logging in",
    "auth/invalid-email": "invalid email address",
    "auth/operation-not-allowed": "operation not allowed",
    "auth/weak-password": "weak password",
    "success": "user created"
  },
  signin: {
    "auth/invalid-email": "invalid email address",
    "auth/user-disabled": "user banned",
    "auth/user-not-found": "user not found",
    "auth/wrong-password": "incorrect password",
    "success": "logged in"
  }
}; //*/

async function captureEmailPassword(email, password, mint) {
  let name = email.split("@")[0];
  let success,
      message,
      gotoSignin = false;

  if (mint) {
    try {
      await secondary.auth().createUserWithEmailAndPassword(email, password);
      let __uid = secondary.auth().currentUser.uid;
      secondary.auth().signOut();
      success = true;
      message = messages.signup.success;
      gotoSignin = true;
      let uid = generateId();
      let md5 = CryptoJS.MD5(uid);
      await db.collection("users").doc(uid).set({
        __uid,
        uid,
        name,
        email,
        profile: `https://www.gravatar.com/avatar/${md5}?s=200&d=identicon`,
        polls: [],
        votes: [],
        isComplete: true,
        isAdmin: false
      });
    } catch (error) {
      success = false;
      message = messages.signup[error.code];
      error.code === "auth/email-already-in-use" && (gotoSignin = true);
    }
  } else {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      success = true;
      message = messages.signin.success;
      window.location.href = "/";
    } catch (error) {
      success = false;
      message = messages.signin[error.code];
    }
  }

  return {
    success,
    message,
    gotoSignin
  };
}