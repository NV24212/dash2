import { RequestHandler } from "express";
import { orderDb, Order, OrderItem } from "../lib/orders-db";
import { productDb } from "../lib/supabase";

export const getAllOrders: RequestHandler = async (req, res) => {
  try {
    const orders = await orderDb.getAll();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    console.log("Creating order with data:", req.body);
    const {
      customerId,
      items,
      status,
      deliveryType,
      deliveryArea,
      notes,
      total,
    } = req.body;

    // Validate required fields
    if (!customerId) {
      console.error("Missing customerId:", req.body);
      return res.status(400).json({ error: "Customer ID is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("Invalid items data:", { items });
      return res.status(400).json({
        error: "Order items are required and must be a non-empty array",
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        console.error("Invalid item data:", item);
        return res.status(400).json({
          error: "Each item must have productId, quantity, and price",
        });
      }

      if (item.quantity <= 0) {
        console.error("Invalid quantity:", item);
        return res
          .status(400)
          .json({ error: "Item quantity must be greater than 0" });
      }

      if (item.price < 0) {
        console.error("Invalid price:", item);
        return res.status(400).json({ error: "Item price cannot be negative" });
      }
    }

    // Calculate expected total
    const itemsTotal = items.reduce(
      (sum: number, item: OrderItem) => sum + item.price * item.quantity,
      0,
    );

    // Use the total from request if provided, otherwise use calculated total
    const finalTotal = total !== undefined ? total : itemsTotal;

    console.log("Total calculation:", {
      itemsTotal: itemsTotal.toFixed(2),
      requestTotal: total,
      finalTotal: finalTotal.toFixed(2),
    });

    const orderData = {
      customerId,
      items,
      total: finalTotal,
      status: status || "processing",
      deliveryType: deliveryType || "delivery",
      deliveryArea: deliveryArea || "sitra",
      notes: notes || "",
    };

    console.log("Creating order with processed data:", orderData);
    let newOrder;
    try {
      newOrder = await orderDb.create(orderData);
      console.log("Order created successfully:", newOrder.id);
    } catch (createError) {
      console.error("Failed to create order in database:", createError);
      return res.status(500).json({
        error: "Failed to create order in database",
        details:
          createError instanceof Error
            ? createError.message
            : "Unknown database error",
      });
    }

    console.log("Order created successfully:", newOrder.id);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const updateOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Recalculate total if items are updated
    if (updates.items) {
      updates.total = updates.items.reduce(
        (sum: number, item: OrderItem) => sum + item.price * item.quantity,
        0,
      );
    }

    const updatedOrder = await orderDb.update(id, updates);
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.status(500).json({ error: "Failed to update order" });
    }
  }
};

export const deleteOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await orderDb.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting order:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.status(500).json({ error: "Failed to delete order" });
    }
  }
};

export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderDb.getById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};
