import { connect } from "mongoose";

const dbConnect = async (): Promise<void> => {
  try {
    await connect(process.env.MONGO_URL!);
    console.log("MongoDB conectado correctamente");
  } catch (err) {
    console.error("Error al conectar con MongoDB:", err);
    throw err;
  }
};

export default dbConnect;