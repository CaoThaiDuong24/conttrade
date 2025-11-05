// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import prisma from "../lib/prisma.js";
import { randomUUID } from "crypto";
import { NotificationService } from "../lib/notifications/notification-service.js";

interface CreateRFQBody {
  listing_id: string;
  purpose: "sale" | "rental";
  quantity: number;
  need_by?: string;
  services?: {
    inspection?: boolean;
    repair_estimate?: boolean;
    certification?: boolean;
    delivery_estimate?: boolean;
  };
}

interface RFQQueryParams {
  view?: "sent" | "received";
  show_all?: string; // "true" to show all statuses, otherwise filter by status
}

export default async function rfqRoutes(fastify: FastifyInstance) {
  // GET /rfqs - Lấy danh sách RFQs
  fastify.get<{ Querystring: RFQQueryParams }>(
    "/",
    {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          return reply
            .status(401)
            .send({ success: false, message: "Unauthorized" });
        }
      },
    },
    async (request, reply) => {
      const userId = (request.user as any).userId;
      const { view = "sent", show_all } = request.query;

      try {
        let rfqs: any[] = [];

        if (view === "sent") {
          // Buyer xem RFQs mình đã gửi
          rfqs = await prisma.rfqs.findMany({
            where: { buyer_id: userId },
            include: {
              listings: {
                select: {
                  id: true,
                  title: true,
                  price_amount: true,
                  price_currency: true,
                  containers: {
                    select: {
                      type: true,
                      size_ft: true,
                    },
                  },
                },
              },
              quotes: {
                select: {
                  id: true,
                  status: true,
                  total: true,
                  currency: true,
                  created_at: true,
                },
              },
            },
            orderBy: { submitted_at: "desc" },
          });
        } else if (view === "received") {
          // Seller xem RFQs cho listings của mình
          const sellerListings = await prisma.listings.findMany({
            where: { seller_user_id: userId },
            select: { id: true },
          });

          const listingIds = sellerListings.map((l) => l.id);

          console.log("=== RECEIVED RFQs DEBUG ===");
          console.log("Seller User ID:", userId);
          console.log("Seller Listings:", sellerListings.length);
          console.log("Listing IDs:", listingIds);

          if (listingIds.length === 0) {
            console.log("No listings found for seller");
            rfqs = [];
          } else {
            // Build where clause conditionally based on show_all parameter
            const whereClause: any = {
              listing_id: { in: listingIds },
            };

            // Only filter by status if show_all is not "true"
            if (show_all !== "true") {
              whereClause.status = {
                in: ["SUBMITTED", "QUOTED", "ACCEPTED", "REJECTED"],
              };
            }

            rfqs = await prisma.rfqs.findMany({
              where: whereClause,
              include: {
                listings: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
                users: {
                  select: {
                    id: true,
                    display_name: true,
                    email: true,
                  },
                },
                quotes: {
                  where: { seller_id: userId },
                  select: {
                    id: true,
                    status: true,
                  },
                },
              },
              orderBy: { submitted_at: "desc" },
            });

            console.log("Found RFQs:", rfqs.length);
          }
          console.log("=============================");
        } else {
          // Default case - return empty or error
          console.log("=== UNKNOWN VIEW TYPE ===");
          console.log("View parameter:", view);
          console.log("Valid options: sent, received");

          return reply.status(400).send({
            success: false,
            message: 'Invalid view parameter. Use "sent" or "received"',
          });
        }

        return reply.send({
          success: true,
          data: rfqs,
        });
      } catch (error: any) {
        fastify.log.error("Error fetching RFQs:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to fetch RFQs",
          error: error.message,
        });
      }
    }
  );

  // GET /rfqs/:id - Chi tiết RFQ
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          return reply
            .status(401)
            .send({ success: false, message: "Unauthorized" });
        }
      },
    },
    async (request, reply) => {
      const userId = (request.user as any).userId;
      const { id } = request.params;

      try {
        const rfq = await prisma.rfqs.findUnique({
          where: { id },
          include: {
            listings: {
              include: {
                users: {
                  select: {
                    id: true,
                    display_name: true,
                    email: true,
                  },
                },
                containers: {
                  select: {
                    id: true,
                    type: true,
                    size_ft: true,
                    iso_code: true,
                    condition: true,
                  },
                },
                listing_facets: {
                  select: {
                    key: true,
                    value: true,
                  },
                },
              },
            },
            users: {
              select: {
                id: true,
                display_name: true,
                email: true,
              },
            },
            quotes: {
              include: {
                users: {
                  select: {
                    id: true,
                    display_name: true,
                    email: true,
                  },
                },
                quote_items: true,
              },
              orderBy: { created_at: "desc" },
            },
          },
        });

        if (!rfq) {
          return reply.status(404).send({
            success: false,
            message: "RFQ not found",
          });
        }

        // Check access: buyer or seller của listing
        const isBuyer = rfq.buyer_id === userId;

        // Get seller from included listing data
        const isSeller = rfq.listings?.seller_user_id === userId;

        console.log("=== RFQ DETAIL ACCESS CHECK ===");
        console.log("RFQ ID:", id);
        console.log("Current User ID:", userId);
        console.log("Buyer ID:", rfq.buyer_id);
        console.log("Seller ID:", rfq.listings?.seller_user_id);
        console.log("Is Buyer:", isBuyer);
        console.log("Is Seller:", isSeller);
        console.log("================================");

        if (!isBuyer && !isSeller) {
          return reply.status(403).send({
            success: false,
            message: "You do not have permission to view this RFQ",
          });
        }

        return reply.send({
          success: true,
          data: rfq,
        });
      } catch (error: any) {
        fastify.log.error("Error fetching RFQ:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to fetch RFQ",
          error: error.message,
        });
      }
    }
  );

  // POST /rfqs - Tạo RFQ mới
  fastify.post<{ Body: CreateRFQBody }>(
    "/",
    {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (err: any) {
          console.error("JWT Verification failed for RFQ creation:", {
            error: err.message,
            hasAuthHeader: !!request.headers.authorization,
            authHeaderPreview: request.headers.authorization?.substring(0, 20),
            hasCookie: !!request.cookies?.accessToken,
            cookiePreview: request.cookies?.accessToken?.substring(0, 20),
            url: request.url,
            method: request.method,
          });

          return reply.status(401).send({
            success: false,
            message: "Unauthorized",
            error: "TOKEN_INVALID_OR_EXPIRED",
            details:
              process.env.NODE_ENV === "development" ? err.message : undefined,
          });
        }
      },
    },
    async (request, reply) => {
      const userId = (request.user as any).userId;
      const { listing_id, purpose, quantity, need_by, services } = request.body;

      console.log("=== CREATE RFQ DEBUG ===");
      console.log("User ID:", userId);
      console.log("Request body:", request.body);
      console.log("listing_id:", listing_id);
      console.log("purpose:", purpose);
      console.log("quantity:", quantity);
      console.log("services:", services);
      console.log("========================");

      try {
        // Validate listing exists
        const listing = await prisma.listings.findUnique({
          where: { id: listing_id },
        });

        if (!listing) {
          return reply.status(404).send({
            success: false,
            message: "Listing not found",
          });
        }

        if (listing.seller_user_id === userId) {
          return reply.status(400).send({
            success: false,
            message: "Cannot create RFQ for your own listing",
          });
        }

        // Allow approved, published, active, or available status
        const allowedStatuses = [
          "APPROVED",
          "PUBLISHED",
          "ACTIVE",
          "AVAILABLE",
        ];
        console.log("=== STATUS CHECK DEBUG ===");
        console.log("Listing status:", listing.status);
        console.log("Listing status type:", typeof listing.status);
        console.log("Allowed statuses:", allowedStatuses);
        console.log("Is included:", allowedStatuses.includes(listing.status));
        console.log("==========================");

        if (!allowedStatuses.includes(listing.status)) {
          return reply.status(400).send({
            success: false,
            message: `Listing is not available for RFQ. Current status: ${listing.status}`,
          });
        }

        // Calculate expired date (7 days from now)
        const expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + 7);

        // Convert purpose to RFQPurpose enum
        let purposeEnum: string;
        const purposeLower = purpose?.toLowerCase();
        if (purposeLower === "sale" || purposeLower === "purchase") {
          purposeEnum = "PURCHASE";
        } else if (purposeLower === "rental" || purposeLower === "rent") {
          purposeEnum = "RENTAL";
        } else if (purposeLower === "inquiry" || purposeLower === "question") {
          purposeEnum = "INQUIRY";
        } else {
          purposeEnum = "PURCHASE"; // default
        }

        // Create RFQ
        const rfq = await prisma.rfqs.create({
          data: {
            id: randomUUID(),
            listing_id: listing_id,
            buyer_id: userId,
            purpose: purposeEnum as any,
            quantity,
            need_by: need_by ? new Date(need_by) : null,
            services_json: services || {},
            status: "SUBMITTED",
            submitted_at: new Date(),
            expired_at: expiredAt,
            updated_at: new Date(),
          },
          include: {
            listings: {
              select: {
                id: true,
                title: true,
                price_amount: true,
                price_currency: true,
                seller_user_id: true,
                containers: {
                  select: {
                    type: true,
                    size_ft: true,
                  },
                },
              },
            },
            users: {
              select: {
                id: true,
                display_name: true,
                email: true,
              },
            },
          },
        });

        // 🔔 Notify seller about new RFQ
        if (rfq.listings && rfq.users) {
          const buyerName =
            rfq.users.display_name || rfq.users.email || "Người mua";
          const listingTitle = rfq.listings.title || "Container";

          await NotificationService.createNotification({
            userId: rfq.listings.seller_user_id,
            type: "rfq_received",
            title: "Yêu cầu báo giá mới",
            message: `${buyerName} đã gửi yêu cầu báo giá cho ${listingTitle}`,
            orderData: {
              rfqId: rfq.id,
              listingId: rfq.listing_id,
              buyerName: buyerName,
              quantity: rfq.quantity,
              purpose: rfq.purpose,
            },
          });

          console.log(
            "✅ Sent RFQ notification to seller:",
            rfq.listings.seller_user_id
          );
        }

        return reply.status(201).send({
          success: true,
          message: "RFQ created successfully",
          data: rfq,
        });
      } catch (error: any) {
        fastify.log.error("Error creating RFQ:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to create RFQ",
          error: error.message,
        });
      }
    }
  );

  // GET /rfqs/:id/quotes - Lấy tất cả quotes cho một RFQ
  fastify.get<{ Params: { id: string } }>(
    "/:id/quotes",
    {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          return reply
            .status(401)
            .send({ success: false, message: "Unauthorized" });
        }
      },
    },
    async (request, reply) => {
      const userId = (request.user as any).userId;
      const { id } = request.params;

      try {
        // Verify RFQ exists and user has access
        const rfq = await prisma.rfqs.findUnique({
          where: { id },
          include: {
            listings: {
              select: { seller_user_id: true },
            },
          },
        });

        if (!rfq) {
          return reply.status(404).send({
            success: false,
            message: "RFQ not found",
          });
        }

        const isBuyer = rfq.buyer_id === userId;
        const isSeller = rfq.listings.seller_user_id === userId;

        console.log("=== RFQ QUOTES ACCESS CHECK ===");
        console.log("RFQ ID:", id);
        console.log("Current User ID:", userId);
        console.log("Buyer ID:", rfq.buyer_id);
        console.log("Seller ID:", rfq.listings.seller_user_id);
        console.log("Is Buyer:", isBuyer);
        console.log("Is Seller:", isSeller);
        console.log("================================");

        if (!isBuyer && !isSeller) {
          return reply.status(403).send({
            success: false,
            message: "You do not have permission to view quotes for this RFQ",
          });
        }

        // Fetch quotes
        const quotes = await prisma.quotes.findMany({
          where: { rfq_id: id },
          include: {
            users: {
              select: {
                id: true,
                display_name: true,
                email: true,
              },
            },
            quote_items: true,
          },
          orderBy: { created_at: "desc" },
        });

        return reply.send({
          success: true,
          data: quotes,
        });
      } catch (error: any) {
        fastify.log.error("Error fetching quotes:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to fetch quotes",
          error: error.message,
        });
      }
    }
  );
}
