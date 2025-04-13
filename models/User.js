// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   plaidAccessToken: { type: String },
//   createdAt: { type: Date, default: Date.now },
// });

// const User = mongoose.models.User || mongoose.model("User", userSchema);
// export default User;

import mongoose from "mongoose";

// Helper function to generate a default profile image URL based on the user's name
function generateProfileImage(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: {
    type: String,
    default: function () {
      return generateProfileImage(this.name);
    },
  },
  plaidAccessToken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
