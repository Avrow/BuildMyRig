import { Router } from "express";
import {
	getAllProducts,
	scrapeAndStoreProduct,
} from "../controller/productController.js";

const productRouter = Router();

productRouter.get("/products", getAllProducts);
productRouter.post("/scrape", scrapeAndStoreProduct);

export default productRouter;
