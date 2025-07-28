import { jest } from "@jest/globals"
import "@testing-library/jest-dom"
import { DatabaseService } from "@/lib/services/database-service"
import { EnhancedNotificationService } from "@/lib/services/enhanced-notification-service"

// Mock the services
jest.mock("@/lib/services/database-service")
jest.mock("@/lib/services/enhanced-notification-service")

const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>
const mockNotificationService = EnhancedNotificationService as jest.Mocked<typeof EnhancedNotificationService>

describe("Real-time Chat System Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Conversation Management", () => {
    test("should load conversations for user", async () => {
      const mockConversations = [
        {
          id: "conv_1",
          booking_id: "booking_1",
          client_id: "client_1",
          creative_id: "creative_1",
          status: "active",
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          client: {
            id: "client_1",
            name: "John Client",
            email: "client@example.com",
            role: "client" as const,
          },
          creative: {
            id: "creative_1",
            name: "Jane Creative",
            email: "creative@example.com",
            role: "creative" as const,
          },
          booking: {
            id: "booking_1",
            booking_date: "2024-05-20",
            status: "confirmed" as const,
          },
        },
      ]

      mockDatabaseService.getConversations.mockResolvedValue(mockConversations as any)

      const result = await DatabaseService.getConversations("client_1")

      expect(mockDatabaseService.getConversations).toHaveBeenCalledWith("client_1")
      expect(result).toEqual(mockConversations)
      expect(result[0].client.name).toBe("John Client")
      expect(result[0].creative.name).toBe("Jane Creative")
    })

    test("should create new conversation", async () => {
      const conversationData = {
        booking_id: "booking_1",
        client_id: "client_1",
        creative_id: "creative_1",
        status: "active",
      }

      const mockCreatedConversation = {
        id: "conv_new",
        ...conversationData,
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      }

      mockDatabaseService.createConversation.mockResolvedValue(mockCreatedConversation as any)

      const result = await DatabaseService.createConversation(conversationData)

      expect(result?.id).toBe("conv_new")
      expect(result?.booking_id).toBe("booking_1")
    })
  })

  describe("Message Handling", () => {
    test("should send message successfully", async () => {
      const messageData = {
        conversation_id: "conv_1",
        sender_id: "user_1",
        content: "Hello there!",
        message_type: "text",
      }

      const mockMessage = {
        id: "msg_1",
        ...messageData,
        created_at: new Date().toISOString(),
        read_at: null,
      }

      mockDatabaseService.sendMessage.mockResolvedValue(mockMessage as any)

      const result = await DatabaseService.sendMessage(messageData)

      expect(result?.content).toBe("Hello there!")
      expect(result?.sender_id).toBe("user_1")
    })

    test("should load messages for conversation", async () => {
      const mockMessages = [
        {
          id: "msg_1",
          conversation_id: "conv_1",
          sender_id: "user_1",
          content: "Hello!",
          message_type: "text",
          created_at: new Date().toISOString(),
          read_at: null,
          sender: {
            id: "user_1",
            name: "John Doe",
            email: "john@example.com",
          },
        },
      ]

      mockDatabaseService.getMessages.mockResolvedValue(mockMessages as any)

      const result = await DatabaseService.getMessages("conv_1")

      expect(result).toHaveLength(1)
      expect(result[0].content).toBe("Hello!")
      expect(result[0].sender.name).toBe("John Doe")
    })

    test("should mark messages as read", async () => {
      mockDatabaseService.markMessagesAsRead.mockResolvedValue(true)

      const result = await DatabaseService.markMessagesAsRead("conv_1", "user_1")

      expect(result).toBe(true)
      expect(mockDatabaseService.markMessagesAsRead).toHaveBeenCalledWith("conv_1", "user_1")
    })
  })

  describe("Real-time Notifications", () => {
    test("should send new message notification", async () => {
      const mockMessage = {
        id: "msg_1",
        conversation_id: "conv_1",
        sender_id: "sender_1",
        content: "New message content",
        created_at: new Date().toISOString(),
      }

      const mockRecipient = {
        id: "recipient_1",
        name: "Recipient User",
        phone: "+255123456789",
        email: "recipient@example.com",
      }

      const mockSender = {
        id: "sender_1",
        name: "Sender User",
      }

      mockNotificationService.sendNewMessageNotification.mockResolvedValue()

      await EnhancedNotificationService.sendNewMessageNotification(mockMessage, mockRecipient, mockSender)

      expect(mockNotificationService.sendNewMessageNotification).toHaveBeenCalledWith(
        mockMessage,
        mockRecipient,
        mockSender,
      )
    })
  })
})
