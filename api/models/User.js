import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    password: String,
  },
  { timestamps: true }
);

// export default User = mongoose.model("User", UserSchema);


// Define and export the User model
const UserModel = mongoose.model("User", UserSchema);

// Export the UserModel so it can be imported in other files
export default UserModel;