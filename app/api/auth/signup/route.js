import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, password } = await req.json();
  await connectToDatabase();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new Response(JSON.stringify({ message: "User already exists" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();

  return new Response(
    JSON.stringify({ message: "User created", userId: user._id }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
}
