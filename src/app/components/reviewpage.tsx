"use client"
import { useState, useEffect } from "react";
import axios from "axios";
interface Review {
  text: string,
  rating: number,
  review_id: number,
  publish_date: string,
  user_id: number
}

interface Comment {
  text: string;
  comment_id: number;
  review_id: number;
}

interface ReviewPageProps {
  reviewData: Review[];
}

export default function ReviewPage({ reviewData }: ReviewPageProps) {
    const [comment, setComment] = useState("");
    const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

    const [reviewComments, setReviewComments] = useState<{ [key: number]: Comment[] }>({});

    useEffect(() => {
      reviewData.forEach((review) => {
      fetchComments(review.review_id);
    });
    
      
    }, [reviewData])
    
   
    const fetchComments = async (review_id: number) => {
      try {
        if (reviewData && reviewData.length > 0) {
          const response = await axios.get(
            `/api/review/getcomment?review_id=${review_id}`
          );
          console.log(response.data.reviews);
          setReviewComments((prevComments) => ({
        ...prevComments,
        [review_id]: response.data.reviews,
      }));
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }
   

    
    const createComment = async (review_id: number, text: string) => {
      
        const user_id = localStorage.getItem("user_id"); 
        try {
            const response = await fetch("/api/review/createcomment", {
            method: "POST",
            body: JSON.stringify({ user_id, review_id, text }),
            headers: { "Content-Type": "application/json" },
            });


        }
        catch(error) {
          console.error(error); 
        }

        fetchComments(reviewData[0].review_id); 
    }
    return (
        <>
          <div className="text-start">
            {reviewData.map((review, index) => (
            <div key={index} className="bg-purple-50 hover:bg-slate-100 transition-colors w-[100%] mb-10 ease-in bg-white outline-3 shadow-lg rounded-xl gap-3 p-4">
                <div className="border-b-2 mb-4">
                  <h1 className="">{"⭐".repeat(review.rating)}</h1>
                  <p className="text-sm">{" "}
									{new Date(review.publish_date).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}{" "}</p>

                </div>
               <div className="pb-5">
                  <h1>{review.text}</h1>
                </div>
              <h1>Add a comment</h1>
              <textarea
              id="review"
              value={selectedReviewId === review.review_id ? comment : ""}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-start pt-1 p-2 border border-gray-300 rounded-md leading-tight resize-none min-h-[100px]"
              onFocus={() => setSelectedReviewId(review.review_id)}
              disabled={selectedReviewId !== null && selectedReviewId !== review.review_id}

            />
            <button onClick={() => {
               createComment(review.review_id, comment);
                setComment("");
                setSelectedReviewId(null);
            }}
             className=" bg-slate-300 p-1 mb-3 rounded-md text-sm">Post</button>
                <div>
            {reviewComments[review.review_id]?.map((comment, index) => (
              <div key={index} className="bg-purple-100 mb-3 p-2 rounded-md">
                <p>{comment.text}</p>
              </div>
            ))}
          </div>
              
            </div>
           
                  
            ))}
      </div>
        </>
    )

}