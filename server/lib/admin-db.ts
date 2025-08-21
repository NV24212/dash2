import { supabase } from "./supabase";

// Dynamic import for bcryptjs to handle environments where it might not be available
let bcrypt: any = null;
let bcryptAvailable = false;
try {
  bcrypt = require("bcryptjs");
  bcryptAvailable = true;
  console.log("✅ bcryptjs loaded successfully");
} catch (error) {
  console.warn("⚠️ bcryptjs not available, using fallback authentication for development");
  bcryptAvailable = false;
}

// Admin user interface
export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  created_at?: string;
  updated_at?: string;
}

// In-memory fallback for admin user
let fallbackAdminUser: AdminUser | null = null;

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Initialize default admin user if none exists
async function initializeDefaultAdmin() {
  try {
    const existingAdmin = await getAdminUser();
    if (!existingAdmin) {
      console.log("No admin user found, creating default admin...");

      // Default admin credentials
      const defaultPassword = "azhar2311";
      const defaultEmail = "admin@azharstore.com";

      let hashedPassword: string;
      if (bcryptAvailable) {
        hashedPassword = await bcrypt.hash(defaultPassword, 10);
      } else {
        // Fallback: store plain password with a prefix to identify it
        hashedPassword = "PLAIN:" + defaultPassword;
        console.warn("⚠️ Using plain-text password storage (development only!)");
      }

      const newAdmin: AdminUser = {
        id: generateId(),
        email: defaultEmail,
        password_hash: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (!supabase) {
        fallbackAdminUser = newAdmin;
        console.log("✅ Default admin user created in memory");
        return newAdmin;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .insert([newAdmin])
        .select()
        .single();

      if (error) {
        console.warn(
          "Could not create admin user in Supabase, using fallback:",
          error.message,
        );
        fallbackAdminUser = newAdmin;
        return newAdmin;
      }

      console.log("✅ Default admin user created in Supabase");
      return data;
    }
  } catch (error) {
    console.warn("Could not initialize admin user:", error);
    // Create fallback admin user
    const defaultPassword = "azhar2311";

    let hashedPassword: string;
    if (bcryptAvailable) {
      hashedPassword = await bcrypt.hash(defaultPassword, 10);
    } else {
      // Fallback: store plain password with a prefix to identify it
      hashedPassword = "PLAIN:" + defaultPassword;
      console.warn("⚠️ Creating fallback admin with plain-text password (development only!)");
    }

    fallbackAdminUser = {
      id: generateId(),
      email: "admin@azharstore.com",
      password_hash: hashedPassword,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

// Initialize admin user on module load
initializeDefaultAdmin();

// Admin database operations
export const adminDb = {
  // Get admin user (there should be only one)
  async getAdminUser(): Promise<AdminUser | null> {
    if (!supabase) {
      return fallbackAdminUser;
    }

    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No admin user found
        }
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        return fallbackAdminUser;
      }

      return data;
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      return fallbackAdminUser;
    }
  },

  // Verify admin password
  async verifyPassword(password: string): Promise<boolean> {
    try {
      const admin = await this.getAdminUser();
      if (!admin) {
        return false;
      }

      // Check if it's a plain-text password (fallback mode)
      if (admin.password_hash.startsWith("PLAIN:")) {
        const plainPassword = admin.password_hash.substring(6); // Remove "PLAIN:" prefix
        console.warn("⚠️ Using plain-text password verification (development only!)");
        return password === plainPassword;
      }

      // Use bcrypt if available
      if (bcryptAvailable) {
        return await bcrypt.compare(password, admin.password_hash);
      }

      console.error("No password verification method available");
      return false;
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  },

  // Update admin password
  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      if (!bcrypt) {
        console.error("bcrypt not available, cannot update password");
        return false;
      }

      const admin = await this.getAdminUser();
      if (!admin) {
        return false;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updates = {
        password_hash: hashedPassword,
        updated_at: new Date().toISOString(),
      };

      if (!supabase) {
        if (fallbackAdminUser) {
          fallbackAdminUser = { ...fallbackAdminUser, ...updates };
          return true;
        }
        return false;
      }

      const { error } = await supabase
        .from("admin_users")
        .update(updates)
        .eq("id", admin.id);

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        if (fallbackAdminUser) {
          fallbackAdminUser = { ...fallbackAdminUser, ...updates };
          return true;
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  },

  // Update admin email
  async updateEmail(newEmail: string): Promise<boolean> {
    try {
      const admin = await this.getAdminUser();
      if (!admin) {
        return false;
      }

      const updates = {
        email: newEmail,
        updated_at: new Date().toISOString(),
      };

      if (!supabase) {
        if (fallbackAdminUser) {
          fallbackAdminUser = { ...fallbackAdminUser, ...updates };
          return true;
        }
        return false;
      }

      const { error } = await supabase
        .from("admin_users")
        .update(updates)
        .eq("id", admin.id);

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        if (fallbackAdminUser) {
          fallbackAdminUser = { ...fallbackAdminUser, ...updates };
          return true;
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error updating email:", error);
      return false;
    }
  },
};

// Export for use in other files
export async function getAdminUser() {
  return await adminDb.getAdminUser();
}

export async function verifyAdminPassword(password: string) {
  return await adminDb.verifyPassword(password);
}
