import mongoose from "mongoose";

const mongooseConnectionOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 45_000,
  connectTimeoutMS: 30_000,
  socketTimeoutMS: 45_000,
  maxPoolSize: 10,
  family: 4,
};

const buildMongoUriFromParts = (): string | null => {
  const user = process.env.MONGODB_USER?.trim();
  const password = process.env.MONGODB_PASSWORD;
  const host =
    process.env.MONGODB_CLUSTER_HOST?.trim() ||
    "cluster0.7cvebfo.mongodb.net";
  const dbName = process.env.MONGODB_DB_NAME?.trim() || "VowLinkDB";

  if (!user || password === undefined || password === "") {
    return null;
  }

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);

  return `mongodb+srv://${encodedUser}:${encodedPassword}@${host}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
};

export const resolveMongoUri = (): string => {
  const fromParts = buildMongoUriFromParts();
  if (fromParts) {
    return fromParts;
  }

  const databaseUri = process.env.MONGODB_URI?.trim();
  if (databaseUri) {
    return databaseUri;
  }

  throw new Error(
    "Missing MongoDB config: set MONGODB_USER + MONGODB_PASSWORD, or MONGODB_URI.",
  );
};

export const isMongoConnected = (): boolean =>
  mongoose.connection.readyState === 1;

export const initializeDatabaseConnection = async (): Promise<void> => {
  const databaseUri = resolveMongoUri();

  await mongoose.connect(databaseUri, mongooseConnectionOptions);
  // eslint-disable-next-line no-console
  console.log("MongoDB connection established.");
};

export const connectMongoWithRetries = async (
  attempts = 3,
  delayMs = 4000,
): Promise<void> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await initializeDatabaseConnection();
      return;
    } catch (error) {
      lastError = error;
      // eslint-disable-next-line no-console
      console.warn(
        `MongoDB connection attempt ${attempt}/${attempts} failed.`,
        error instanceof Error ? error.message : error,
      );
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
};
