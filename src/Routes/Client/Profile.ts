import { Response , Router} from "express"
import { userAuth } from "../userAuth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const client_Profile = Router();

// ====================== 1. GET PROFILE ======================
client_Profile.get("/me", userAuth, async (req: any, res: Response) => {
    try {
        const ClientId = req.user.id;

        const data = await prisma.client.findUnique({
            where: { id: ClientId },
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
client_Profile.put("/me", userAuth, async (req: any, res: Response) => {
    try {
        const ClientId = req.user.id;

        const {
            name,
            ImgURL,
            Contect_number,
        } = req.body;

        const dataToUpdate: any = {};

        if (name !== undefined) dataToUpdate.name = name;
        if (ImgURL !== undefined) dataToUpdate.ImgURL = ImgURL;
        if (Contect_number !== undefined) dataToUpdate.Contect_number = Contect_number;

        const data = await prisma.client.update({
            where: { id: ClientId },
            data: dataToUpdate
        });

        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = client_Profile;
