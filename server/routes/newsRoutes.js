import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// get drafts for user
router.get("/drafts/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    //query supabase gikan sa orig user
    const { data: drafts, error } = await supabase
      .from("news_drafts")
      .select("*")
      .eq("user_id", userId)
      .order("last_modified", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      drafts: drafts || [],
    });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drafts",
      error: error.message,
    });
  }
});

//save or update news draft
router.post("/drafts/save", async (req, res) => {
  const { draft_id, user_id, title, event_date, location, content, category } =
    req.body;

  try {
    //if draft_id exists, update existing draft
    if (draft_id) {
      const { data, error } = await supabase
        .from("news_drafts")
        .update({
          title,
          event_date,
          location,
          content,
          category,
          last_modified: new Date().toISOString(),
        })
        .eq("draft_id", draft_id) //update correct draft
        .eq("user_id", user_id) //ensure draft belongs to user
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: "Draft updated successfully",
        draft_id: data.draft_id,
      });

      //if draft_id not exists, create new draft
    } else {
      const { data, error } = await supabase
        .from("news_drafts")
        .insert([
          {
            user_id,
            title,
            event_date,
            location,
            content,
            category,
            last_modified: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: "Draft created successfully",
        draft_id: data.draft_id,
      });
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save draft",
      error: error.message,
    });
  }
});

// delete news draft
router.delete("/drafts/:draftId", async (req, res) => {
  const { draftId } = req.params;

  try {
    const { error } = await supabase
      .from("news_drafts")
      .delete()
      .eq("draft_id", draftId); // delete @ primary key

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Draft deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting draft:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete draft",
      error: error.message,
    });
  }
});

//publish article
router.post("/publish", async (req, res) => {
  const { user_id, title, event_date, location, content, category } = req.body;

  try {
    //fetch user fullname from users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("fullname")
      .eq("user_id", user_id)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const author_name = userData.fullname;

    //insert the article into published news table
    const { data: newsData, error: newsError } = await supabase
      .from("newsPublished")
      .insert([
        {
          user_id,
          author_name,
          title,
          event_date,
          location,
          content,
          category,
          publish_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (newsError) throw newsError;

    res.status(201).json({
      success: true,
      message: "Article published successfully",
      news_id: newsData.news_id,
    });
  } catch (error) {
    console.error("Error publishing article:", error);
    res.status(500).json({
      success: false,
      message: "Failed to publish article",
      error: error.message,
    });
  }
});

//get all published news articles
router.get("/", async (req, res) => {
  try {
    const { data: articles, error } = await supabase
      .from("newsPublished")
      .select("*")
      .order("publish_date", { ascending: false }); // Most recent first

    if (error) throw error;

    res.status(200).json({
      success: true,
      articles: articles || [],
    });
  } catch (error) {
    console.error("Error fetching news articles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
      error: error.message,
    });
  }
});

//update published article
router.put("/:newsId", async (req, res) => {
  const { newsId } = req.params;
  const { title, category, event_date, location, content } = req.body;

  try {
    // Update the article in the newsPublished table
    const { data: updatedArticle, error: updateError } = await supabase
      .from("newsPublished")
      .update({
        title,
        category,
        event_date: event_date || null,
        location: location || null,
        content,
      })
      .eq("news_id", newsId)
      .select()
      .single();

    if (updateError) throw updateError;

    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      article: updatedArticle,
    });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update article",
      error: error.message,
    });
  }
});

//fetch article by ID
router.get("/:newsId", async (req, res) => {
  const { newsId } = req.params;

  try {
    const { data: article, error } = await supabase
      .from("newsPublished")
      .select("*")
      .eq("news_id", newsId)
      .single();

    if (error) throw error;

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      article,
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch article",
      error: error.message,
    });
  }
});

// delete published news article
router.delete("/:newsId", async (req, res) => {
  const { newsId } = req.params;

  try {
    // Delete the article from the newsPublished table
    const { error: deleteError } = await supabase
      .from("newsPublished")
      .delete()
      .eq("news_id", newsId);

    if (deleteError) throw deleteError;

    res.status(200).json({
      success: true,
      message: "News article deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting news article:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete news article",
      error: error.message,
    });
  }
});

export default router;
