import express, { urlencoded } from "express";
import colors from "colors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// dotenv configuration
dotenv.config();

// environment variables
const PORT = process.env.PORT || 3000;

// initialize express
const app = express();

// initialize prisma
const prisma = new PrismaClient();

// middleware to parse JSON request bodies
app.use(express.json());
app.use(urlencoded({ extended: false }));

// controllers

// user

// get all users
app.get("/user", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: {
          include: {
            post: true,
            category: true,
          },
        },
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
});

// create a user
app.post("/user", async (req, res) => {
  const data = req.body;

  const user = await prisma.user.create({ data });

  res.status(200).json(user);
});

// delete a user
app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;

  const deleteAUser = await prisma.user.delete({ where: { id: Number(id) } });

  res.status(200).json(deleteAUser);
});

// update a user
app.patch("/user/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const updateAUser = await prisma.user.update({
    where: { id: Number(id) },
    data,
  });

  res.status(200).json(updateAUser);
});

// posts

// get all post
app.get("/post", async (req, res) => {
  // k post korce tar details janar jonno include
  const posts = await prisma.posts.findMany({
    include: {
      categories: true,
    },
  });

  res.status(200).json(posts);
});

// create a post
app.post("/post", async (req, res) => {
  try {
    const { title, desc, categoryId, userId } = req.body;

    // Check if categoryId is provided and is an array
    if (!categoryId || !Array.isArray(categoryId)) {
      return res.status(400).json({ error: "categoryId must be an array." });
    }

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ error: "userId must be provided." });
    }

    // Create the post and connect it to the categories by their IDs
    const post = await prisma.posts.create({
      data: {
        title,
        desc,
        categories: {
          create: categoryId.map((id) => ({
            category: { connect: { id } },
            assignedBy: { connect: { id: userId } },
          })),
        },
      },
    });

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the post." });
  }
});

// delete a post
app.delete("/post/:id", async (req, res) => {
  const { id } = req.params;

  const deleteAPost = await prisma.post.delete({ where: { id: Number(id) } });

  res.status(200).json(deleteAPost);
});

// categories

// get all categorie
app.get("/category", async (req, res) => {
  const categories = await prisma.categories.findMany({
    include: {
      posts: true,
    },
  });

  res.status(200).json(categories);
});

// create a category
app.post("/category", async (req, res) => {
  try {
    const data = req.body;

    // Create the post and connect it to an existing author by their ID
    const category = await prisma.categories.create({
      data,
    });

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the post." });
  }
});

// delete a post
app.delete("/post/:id", async (req, res) => {
  const { id } = req.params;

  const deleteAPost = await prisma.post.delete({ where: { id: Number(id) } });

  res.status(200).json(deleteAPost);
});

// server listening on port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgGreen.black.bold);
});
