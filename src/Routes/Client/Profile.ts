import { Response , Router} from "express"
import { userAuth } from "../userAuth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const client_Profile = Router();

// ====================== 1. GET PROFILE ======================
client_Profile.get("/Profile/me", userAuth, async (req: any, res) => {
  try {
    const clientId = req.user.userId;

    const client = await prisma.client.findUnique({
      where: { userId: clientId },
      select : {
        id: true,
        username: true,
        ImgURL: true,
        age: true,
        email: true,
        gender: true
      }
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.json(client);
    
  } catch (err: any) {
    console.error("Get profile failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ====================== 2. UPDATE PROFILE ======================
client_Profile.put("/Profile/me", userAuth, async (req: any, res) => {
  try {
    const clientId = req.user.userId;

    const { username, age, email, gender, ImgURL } = req.body;

    const dataToUpdate: any = {};

    if (username) dataToUpdate.username = username;
    if (age) dataToUpdate.age = Number(age);
    if (email) dataToUpdate.email = email;
    if (gender) dataToUpdate.gender = gender;
    if (ImgURL) dataToUpdate.ImgURL = ImgURL;

    const updated = await prisma.client.update({
      where: { userId: clientId },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        ImgURL: true,
        age: true,
        email: true,
        gender: true
      }
    });

    return res.json(updated);

  } catch (err: any) {
    console.error("Update profile failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default client_Profile;
