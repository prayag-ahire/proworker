import { Response , Router} from "express"
import { userAuth } from "../userAuth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const client_Profile = Router();

// ====================== 1. GET PROFILE ======================
client_Profile.get("/Profile/me", userAuth, async (req: any, res) => {
  try {
    const ClientId = req.user.id;

    const data = await prisma.client.findUnique({
      where: { id: ClientId },
      select : {
        id: true,
        username: true,
        ImgURL: true,
        age: true,
        email: true,
        gender: true,
      }
    });

    if (!data) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(data);
    
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// ====================== 2. UPDATE PROFILE ======================
client_Profile.put("/Profile/me", userAuth, async (req: any, res) => {
  try {
    const ClientId = req.user.id;

    const { name, age, email, gender, ImgURL, Contact_number } = req.body;

    const dataToUpdate: any = {};

    if (name) dataToUpdate.name = name;
    if (age) dataToUpdate.age = Number(age);
    if (email) dataToUpdate.email = email;
    if (gender) dataToUpdate.gender = gender;
    if (ImgURL) dataToUpdate.ImgURL = ImgURL;
    if (Contact_number) dataToUpdate.Contact_number = Contact_number;

    const updated = await prisma.client.update({
      where: { id: ClientId },
      data: dataToUpdate
    });

    res.json(updated);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default client_Profile;
