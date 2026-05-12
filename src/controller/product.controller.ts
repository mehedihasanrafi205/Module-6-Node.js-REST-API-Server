import type { IncomingMessage, ServerResponse } from "http";
import { insertProduct, readProduct } from "../service/product.service";
import type { IProduct } from "../types/product.type";
import { parseBody } from "../utility/parseBody";
import { sendResponse } from "../utility/sendResponse";

export const productController = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  // console.log("req", req);
  const url = req.url;
  const method = req.method;

  const urlParts = url?.split("/");

  const id =
    urlParts && urlParts[1] === "products" ? Number(urlParts[2]) : null;

  //   console.log(id);
  if (url === "/products" && method === "GET") {
    try {
      const products = readProduct();

      return sendResponse(
        res,
        200,
        true,
        "Products retrieved successfully",
        products,
      );
    } catch (error) {
      return sendResponse(res, 500, false, "Something went wrong!", error);
    }
  } else if (method === "GET" && id !== null) {
    try {
      const products = readProduct();
      const product = products.find((p: IProduct) => p.id === id);

      if (!product) {
        return sendResponse(res, 404, true, "PProduct Not Found!");
      }
      return sendResponse(
        res,
        200,
        true,
        "Products retrieved successfully",
        products,
      );
    } catch (error) {
      return sendResponse(res, 500, false, "Something went wrong!", error);
    }

    // Created Product by Post Method
  } else if (method === "POST" && url === "/products") {
    const body = await parseBody(req);
    // console.log("Body",body);

    const products = readProduct();
    const newProduct = {
      id: Date.now(),
      ...body,
    };

    // console.log(newProduct)

    products.push(newProduct);

    // console.log(products);

    insertProduct(products);

    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: " Product Created successfully",
        data: newProduct,
      }),
    );
  } else if (method === "PUT" && id !== null) {
    const body = await parseBody(req);

    const products = readProduct();

    const index = products.findIndex((p: IProduct) => p.id === id);

    // console.log(index)
    if (index < 0) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: " Product Not Found!",
          data: null,
        }),
      );
    }
    // console.log(products[index]);
    products[index] = { id: products[index].id, ...body };

    insertProduct(products);

    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product Updated Successfully",
        data: products[index],
      }),
    );
  } else if (method === "DELETE" && id !== null) {
    const products = readProduct();

    const index = products.findIndex((p: IProduct) => p.id === id);
    if (index < 0) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: " Product Not Found!",
          data: null,
        }),
      );
    }

    //  const arr = ["1", "2", "3", "4"];
    // arr.splice(2, 1);
    // console.log(arr);

    products.splice(index, 1);

    // console.log(products)

    insertProduct(products);

    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product Deleted Successfully",
        data: null,
      }),
    );
  }
};
