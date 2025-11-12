import { connect } from "mongoose";

const dbConnect = async (): Promise<void> => {
  try {
    await connect(process.env.MONGO_URL!, {
      dbName: process.env.DB_NAME,
    });
    console.log(`MongoDB conectado a la base de datos: ${process.env.DB_NAME}`);
  } catch (err) {
    console.error("Error al conectar con MongoDB:", err);
    throw err;
  }
};

export default dbConnect;