
import express from "express";
import { supabase } from "../supabaseClient.js"; 

const router = express.Router();

router.get("/:revieweeId", async (req, res) => {
  const { revieweeId } = req.params;

  try {
    const { data: reviewsData, error } = await supabase
      .from("user_review")
      .select(`
        review_id,
        rating,
        comment,
        created_at,
        reviewer_id,
        
        reviewer:reviewer_id ( fullname ) 
      `)  
      .eq("reviewee_id", revieweeId)  
      .order("created_at", { ascending: false });  

    if (error) {
      console.error("Reviews Fetch Error:", error);
      return res.status(500).json({ error: "Failed to fetch reviews." });
    }

    const formattedReviews = (reviewsData || []).map((review) => ({
      review_id: review.review_id,
      reviewer_id: review.reviewer_id,
      reviewee_id: review.reviewee_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      
      reviewer_name: review.reviewer?.fullname || "Anonymous", 
      reviewer_avatar: null, 
    }));
    
    res.status(200).json(formattedReviews);

  } catch (err) {
    console.error("Get Reviews Server Error:", err.message);
    res.status(500).json({ message: "Internal Server Error", details: err.message });
  }
});

export default router;