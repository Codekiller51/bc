"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"
import { toast } from "sonner"

interface ReviewSystemProps {
  bookingId: string
  creativeId: string
  clientId: string
  onReviewSubmitted?: () => void
}

export function ReviewSystem({ bookingId, creativeId, clientId, onReviewSubmitted }: ReviewSystemProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)
    try {
      await EnhancedDatabaseService.createReview({
        booking_id: bookingId,
        client_id: clientId,
        creative_id: creativeId,
        rating,
        comment: comment.trim() || null
      })

      toast.success("Review submitted successfully!")
      onReviewSubmitted?.()
      
      // Reset form
      setRating(0)
      setComment("")
    } catch (error) {
      console.error("Failed to submit review:", error)
      toast.error("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Stars */}
        <div>
          <label className="text-sm font-medium mb-2 block">Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="text-sm font-medium mb-2 block">Comment (Optional)</label>
          <Textarea
            placeholder="Share your experience working with this creative professional..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitReview}
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

interface ReviewDisplayProps {
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    created_at: string
    client: {
      name: string
      avatar_url?: string
    }
  }>
}

export function ReviewDisplay({ reviews }: ReviewDisplayProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            This creative professional hasn't received any reviews yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500">{reviews.length} reviews</div>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                
                return (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <span className="text-sm w-8">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.client.avatar_url || "/placeholder.svg"} alt={review.client.name} />
                    <AvatarFallback>{review.client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{review.client.name}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}