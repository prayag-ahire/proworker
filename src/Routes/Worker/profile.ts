import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const worker_profile = Router();

// ------------------ GET profile (for Profile screen) ------------------
worker_profile.get("/profile/me", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;

    const data = await prisma.worker.findUnique({
    where: { id: workerId },
    select: {
      id: true,
      username: true,
      ImgURL: true,
      Rating: true,
      Description: true,
      Charges_PerVisit: true,

      worker_image: {
        select: {
          id: true,
          name: true,
          img_URL: true
        }
      },

      Worker_video: {
        select: {
          id: true,
          Name: true,
          Video_URL: true
        }
      },

      review: {
        select: {
          images: {
            select: {
              id: true,
              name: true,
              img_URL: true
            }
          },
          videos: {
            select: {
              id: true,
              name: true,
              video_URL: true
            }
          }
        }
      }
    }
  });


    if (!data) return res.status(404).json({ message: "Worker not found" });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ------------------ PARTIAL UPDATE profile (Edit screen) ------------------
// Only update fields provided in the request body
worker_profile.put("/profile/me", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const {
      Name,
      ImgURL,
      Contect_number,
      Description,
      Charges_PerHour,
      Charges_PerVisit,
    } = req.body;

    const dataToUpdate: any = {};
    if (Name !== undefined) dataToUpdate.Name = Name;
    if (ImgURL !== undefined) dataToUpdate.ImgURL = ImgURL;
    if (Contect_number !== undefined) dataToUpdate.Contect_number = Contect_number;
    if (Description !== undefined) dataToUpdate.Description = Description;
    if (Charges_PerHour !== undefined) dataToUpdate.Charges_PerHour = Charges_PerHour;
    if (Charges_PerVisit !== undefined) dataToUpdate.Charges_PerVisit = Charges_PerVisit;

    const updated = await prisma.worker.update({
      where: { userId: workerId },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        ImgURL: true,
        Rating: true,
        Description: true,
        Charges_PerVisit: true,
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// ------------------ ADD new image ------------------
// (Frontend uploads to Cloudinary → sends name + img_URL)
worker_profile.post("/profile/me/images", userAuth, async (req: any, res: Response) => {
  try {
    const { name, img_URL } = req.body;

    if (!name || !img_URL) {
      return res.status(400).json({ message: "name and img_URL are required" });
    }

    const created = await prisma.workerImage.create({
      data: {
        workerId: req.user.id,
        name,
        img_URL
      }
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload image" });
  }
});


// ------------------ DELETE image ------------------
// Secure: workerId must match
worker_profile.delete("/profile/me/images/:id", userAuth, async (req: any, res: Response) => {
  try {
    const imageId = Number(req.params.id);

    const deleted = await prisma.workerImage.deleteMany({
      where: {
        id: imageId,
        workerId: req.user.id   // secure check
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Image not found or unauthorized" });
    }

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete image" });
  }
});


// ------------------ ADD new video ------------------
// (Frontend uploads to Cloudinary → sends Name + Video_URL)
worker_profile.post("/profile/me/videos", userAuth, async (req: any, res: Response) => {
  try {
    const { Name, Video_URL } = req.body;

    if (!Name || !Video_URL) {
      return res.status(400).json({ message: "Name and Video_URL are required" });
    }

    const created = await prisma.workerVideo.create({
      data: {
        workerId: req.user.id,
        Name,
        Video_URL
      }
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload video" });
  }
});




// ------------------ DELETE video ------------------
worker_profile.delete("/profile/me/videos/:id", userAuth, async (req: any, res: Response) => {
  try {
    const videoId = Number(req.params.id);

    const deleted = await prisma.workerVideo.deleteMany({
      where: {
        id: videoId,
        workerId: req.user.id   // secure
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Video not found or unauthorized" });
    }

    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete video" });
  }
});


export default worker_profile;


// the user profile is working fine now